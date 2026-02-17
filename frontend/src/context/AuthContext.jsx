import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch user profile from database
    const refreshProfile = async (userId) => {
        if (!userId) {
            setUserProfile(null)
            return null
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setUserProfile(data)
            return data
        } catch (error) {
            console.error('Error fetching user profile:', error)
            setUserProfile(null)
            return null
        }
    }

    useEffect(() => {
        let mounted = true;

        // Check active sessions and sets the user
        const initSession = async () => {
            try {
                // Safety timeout: forced loading false after 5 seconds to prevent infinite spinner
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Session check timeout')), 5000)
                );

                const sessionPromise = async () => {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error) throw error;

                    if (mounted) {
                        setSession(session);
                        setUser(session?.user ?? null);
                        if (session?.user) {
                            await refreshProfile(session.user.id);
                        }
                    }
                };

                // Race the session check against the timeout
                await Promise.race([sessionPromise(), timeoutPromise]);

            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        initSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await refreshProfile(session.user.id);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        }
    }, [])

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        refreshProfile,
        user,
        session,
        userProfile,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="h-screen flex items-center justify-center flex-col space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Initializing Application...</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    )
}
