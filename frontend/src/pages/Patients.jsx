import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, User, FileText, ChevronRight, Eye, Trash2, X, School, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/ui/Loading'

export default function Patients() {
    const { userProfile } = useAuth()
    const isTeacher = userProfile?.role === 'teacher'

    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)

    // New Patient Form
    const [newPatient, setNewPatient] = useState({
        name: '',
        age: '',
        gender: 'Male',
        notes: ''
    })

    useEffect(() => {
        fetchPatients()
    }, [])

    const fetchPatients = async () => {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*, pid, screenings(count), sections(name, school_name)')
                .order('created_at', { ascending: false })

            if (error) throw error
            setPatients(data)
        } catch (error) {
            console.error('Error fetching patients:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePatient = async (e) => {
        e.preventDefault()
        try {
            // Duplicate Check
            const isDuplicate = patients.some(p =>
                p.name.toLowerCase() === newPatient.name.trim().toLowerCase()
            );

            if (isDuplicate) {
                const confirm = window.confirm(`Patient "${newPatient.name}" may already exist. Create anyway?`);
                if (!confirm) return;
            }

            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('patients')
                .insert({
                    created_by: user.id,
                    name: newPatient.name,
                    age: newPatient.age ? parseInt(newPatient.age) : null,
                    gender: newPatient.gender,
                    notes: newPatient.notes
                })

            if (error) throw error

            setShowAddModal(false)
            setNewPatient({ name: '', age: '', gender: 'Male', notes: '' })
            fetchPatients() // Refresh list
        } catch (error) {
            alert(error.message)
        }
    }

    const handleDeletePatient = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete patient "${name}"? This will also delete all their screenings.`)) return

        try {
            const { error } = await supabase
                .from('patients')
                .delete()
                .eq('id', id)

            if (error) throw error

            fetchPatients()
        } catch (error) {
            alert('Error deleting patient: ' + error.message)
        }
    }

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isTeacher ? 'School Students' : 'Patients'}</h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {isTeacher ? 'Add Student' : 'Add Patient'}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search students by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500">
                        <p className="font-bold">Error loading patients</p>
                        <p>{error}</p>
                        <p className="text-sm mt-1">If this says "Column does not exist", please run the <code>migrations_add_pid.sql</code> in Supabase.</p>
                    </div>
                )}
                <ul className="divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                        <li key={patient.id}>
                            <div className="hover:bg-gray-50 px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0">
                                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                                            <User className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4 truncate">
                                            <p className="text-sm font-medium text-blue-600 truncate">
                                                {patient.name}
                                                <span className="ml-2 text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {patient.pid || 'No PID'}
                                                </span>
                                            </p>
                                            <p className="flex items-center text-sm text-gray-500">
                                                {patient.age ? `${patient.age} years old` : 'Age N/A'} , {patient.gender}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 sm:space-x-4">
                                        <div className="hidden sm:flex flex-col items-end text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <FileText className="w-4 h-4 mr-1" />
                                                {patient.screenings?.[0]?.count || 0} Screenings
                                            </span>
                                        </div>

                                        {/* Eye Icon for Details */}
                                        <button
                                            onClick={() => setSelectedPatient(patient)}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => handleDeletePatient(patient.id, patient.name)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete Patient"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <Link
                                            to={`/test?patientId=${patient.id}`}
                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold hover:bg-green-200"
                                        >
                                            Test Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {filteredPatients.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No patients found. Add a new student to get started.
                        </li>
                    )}
                </ul>
            </div>

            {/* Add Patient Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Student</h2>
                        <form onSubmit={handleCreatePatient} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={newPatient.name}
                                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Age</label>
                                    <input
                                        type="number"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={newPatient.age}
                                        onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={newPatient.gender}
                                        onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                >
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Patient Details Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-opacity duration-300">
                    <div
                        className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full overflow-hidden relative animate-fade-in-up flex flex-col md:flex-row"
                        style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedPatient(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 z-10"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        {/* Left Sidebar - Profile */}
                        <div className="w-full md:w-[35%] bg-white p-8 flex flex-col items-center border-r border-gray-100 relative">
                            <div className="w-32 h-32 rounded-full p-1 border-2 border-gray-200 mb-4 flex items-center justify-center relative">
                                <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
                                    {/* Professional Avatar using Initials or Vector style if available. Using 'micah' which is cleaner vector art than avataaars, or back to initials if preferred. Let's try 'micah' first as it's cleaner vector art similar to reference. */}
                                    <img
                                        src={`https://api.dicebear.com/7.x/micah/svg?seed=${selectedPatient.name}&backgroundColor=b6e3f4`}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">{selectedPatient.name}</h2>

                            {/* Pink PID Badge - Matches Reference */}
                            <div className="bg-[#d946ef] text-white px-6 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-sm mb-6">
                                {selectedPatient.pid || 'NO PID'}
                            </div>



                        </div>

                        {/* Right Content - Details */}
                        <div className="w-full md:w-[65%] p-10 bg-white">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="bg-blue-600 text-white p-1.5 rounded-full">
                                    <User className="w-4 h-4" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Age</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedPatient.age || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedPatient.gender || '-'}</p>
                                </div>


                                <div className="col-span-3">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Registered Date</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(selectedPatient.created_at).toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </div>



                                <div className="col-span-3">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Institution Name</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {selectedPatient.sections?.school_name || 'School Address Not Available'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Class: <span className="font-semibold text-gray-700">{selectedPatient.sections?.name || '-'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
