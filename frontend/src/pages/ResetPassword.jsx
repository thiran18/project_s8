import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Lock, Eye, EyeOff, Activity, CheckCircle2 } from 'lucide-react'
import authBg from '../assets/auth-bg.png'

export default function ResetPassword() {
    const { updatePassword } = useAuth()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            return setError("Passwords do not match")
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await updatePassword(password)
            if (error) throw error
            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#1A1D2B] md:bg-[#0F111A] flex font-outfit">
            <div className="w-full flex flex-col md:flex-row border-slate-800/50">
                {/* Left Side - Image/Branding (Desktop Only) */}
                <div className="hidden md:block md:w-1/2 relative">
                    <img
                        src={authBg}
                        alt="Branding"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-12 left-12 right-12 text-white">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                <Activity size={32} />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">HearPulse</h1>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 min-h-screen md:min-h-0 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#1A1D2B]">
                    <div className="max-w-md mx-auto w-full">
                        {!success ? (
                            <>
                                <div className="mb-10 text-center md:text-left">
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">New Password</h2>
                                    <p className="text-slate-400 text-lg">
                                        Please enter your new password below.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-shake">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 px-1">New Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full pl-12 pr-12 py-4 bg-[#252a3d] border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                                placeholder="Min. 6 characters"
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 px-1">Confirm New Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="block w-full pl-12 pr-12 py-4 bg-[#252a3d] border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                                placeholder="Repeat new password"
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transform transition-all active:scale-[0.98]"
                                    >
                                        {loading ? 'Updating Password...' : 'Update Password'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-full mb-6 text-green-500">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Password updated</h2>
                                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                    Your password has been successfully reset. Redirecting you to the sign in page...
                                </p>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full animate-[progress_3s_linear]" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
