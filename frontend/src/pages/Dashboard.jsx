import React, { useEffect, useState } from 'react'
import { Users, FileText, ChevronRight, School, Search, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import Loading from '../components/ui/Loading'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { userProfile } = useAuth()
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [stats, setStats] = useState({
        totalSchools: 0,
        totalClasses: 0,
        pendingReports: 0
    })

    useEffect(() => {
        fetchClinicianData()
    }, [])

    const fetchClinicianData = async () => {
        try {
            setLoading(true)
            // Fetch all sections with their school names and student counts
            const { data: sectionsData, error: secError } = await supabase
                .from('sections')
                .select(`
                    *,
                    patients (
                        id,
                        name,
                        screenings (id, classification, clinical_report)
                    )
                `)
                .order('school_name', { ascending: true })

            if (secError) throw secError

            // Group by school name
            const grouped = sectionsData.reduce((acc, section) => {
                const school = section.school_name || 'Unassigned School'
                if (!acc[school]) acc[school] = []

                // Add calculation for pending reports in this section
                const studentsWithTests = section.patients || []
                const pendingCount = studentsWithTests.reduce((count, stu) => {
                    const latestTest = (stu.screenings || []).sort((a, b) => new Date(b.date) - new Date(a.date))[0]

                    // Pending if: Has test AND Result is NOT Normal AND No Report
                    if (!latestTest) return count;
                    const isNormal = latestTest.classification && (
                        latestTest.classification.includes('Grade 0') ||
                        latestTest.classification.toLowerCase().includes('normal')
                    );

                    if (!isNormal && !latestTest.clinical_report) {
                        return count + 1;
                    }
                    return count;
                }, 0)

                acc[school].push({
                    ...section,
                    pendingCount
                })
                return acc
            }, {})

            const schoolGroups = Object.keys(grouped).map(school => ({
                name: school,
                sections: grouped[school]
            }))

            setSections(schoolGroups)

            // Calculate overall stats
            const totalClasses = sectionsData.length
            const totalSchools = schoolGroups.length
            const pendingReports = sectionsData.reduce((acc, sec) => acc + (sec.pendingCount || 0), 0)

            setStats({
                totalSchools,
                totalClasses,
                pendingReports: sectionsData.reduce((sum, sec) => {
                    const secPending = (sec.patients || []).filter(p => {
                        const latest = (p.screenings || []).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                        if (!latest) return false;
                        const isNormal = latest.classification && (
                            latest.classification.includes('Grade 0') ||
                            latest.classification.toLowerCase().includes('normal')
                        );
                        return !isNormal && !latest.clinical_report;
                    }).length
                    return sum + secPending
                }, 0)
            })

        } catch (error) {
            console.error('Error fetching clinician dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredSections = sections.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.sections.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) return <div className="h-full flex items-center justify-center"><Loading /></div>

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clinician Control Center</h1>
                    <p className="text-gray-500 mt-1">Reviewing results across all associated schools</p>
                </div>

                {/* Search Bar - New */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                        placeholder="Search schools or classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-4 rounded-xl bg-blue-100 text-blue-600">
                        <School className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Schools</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalSchools}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-4 rounded-xl bg-purple-100 text-purple-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Classes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-4 rounded-xl bg-orange-100 text-orange-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
                    </div>
                </div>
            </div>

            {/* Grouped Sections - Updated to use filteredSections */}
            <div className="space-y-6">
                {filteredSections.map(school => (
                    <div key={school.name} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            <h2 className="text-lg font-bold text-gray-800">{school.name}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {school.sections.map(section => (
                                <div key={section.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{section.name}</h3>
                                            <p className="text-xs text-gray-500">{section.patients?.length || 0} Students</p>
                                        </div>
                                        {section.pendingCount > 0 && (
                                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {section.pendingCount} Pending
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {(section.patients || []).slice(0, 3).map(stu => {
                                            const latest = (stu.screenings || []).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                                            const isNormal = latest?.classification && (latest.classification.includes('Grade 0') || latest.classification.toLowerCase().includes('normal'))

                                            return (
                                                <div key={stu.id} className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-600 truncate mr-2">{stu.name}</span>
                                                    <span className={`font-medium ${latest?.clinical_report ? 'text-green-600' : isNormal ? 'text-green-600' : latest ? 'text-orange-500' : 'text-gray-400'}`}>
                                                        {latest?.clinical_report ? 'Reported' : isNormal ? 'Normal' : latest ? 'Pending Review' : 'N/A'}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                        {section.patients?.length > 3 && (
                                            <p className="text-[10px] text-gray-400">+{section.patients.length - 3} more students...</p>
                                        )}
                                    </div>

                                    <Link
                                        to={`/section/${section.id}`}
                                        className="w-full flex items-center justify-center space-x-1 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                        <span>View Results</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredSections.length === 0 && (
                    <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-medium">No results found</p>
                        <p className="text-gray-500 text-sm mt-1">
                            We couldn't find any schools or classes matching "{searchTerm}"
                        </p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-bold"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
