'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useScholarships } from '@/hooks/useScholarships';
import { 
    Pencil, Trash2, Plus, Search, Globe, GraduationCap, 
    Calendar, CheckCircle2, ExternalLink, Award, FileText, 
    Clock, AlertCircle, Sparkles, Filter, RefreshCw
} from 'lucide-react';

export default function ScholarshipsManager() {
    const router = useRouter();
    const { scholarships, isLoading, isError, deleteScholarship } = useScholarships();
    const [searchTerm, setSearchTerm] = useState('');
    const [fundingFilter, setFundingFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const handleCreate = () => {
        router.push('/scholarships/create');
    };

    const handleEdit = (id: number) => {
        router.push(`/scholarships/edit/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this scholarship?')) {
            try {
                await deleteScholarship(id);
            } catch (error) {
                console.error(error);
                alert('Failed to delete scholarship');
            }
        }
    };

    // Calculate deadline status helper
    const getDeadlineStatus = (deadlineStr: string | null) => {
        if (!deadlineStr) return { label: 'No Deadline', color: 'gray', daysLeft: null };
        
        const deadline = new Date(deadlineStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: 'Expired', color: 'red', daysLeft: diffDays };
        } else if (diffDays === 0) {
            return { label: 'Ends Today', color: 'amber', daysLeft: 0 };
        } else if (diffDays <= 7) {
            return { label: `${diffDays} days left`, color: 'amber', daysLeft: diffDays };
        } else {
            return { label: `${diffDays} days left`, color: 'emerald', daysLeft: diffDays };
        }
    };

    // Filtered scholarships
    const filteredScholarships = useMemo(() => {
        return scholarships.filter((item) => {
            const matchesSearch = 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.country && item.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.degree_level && item.degree_level.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.funding_type && item.funding_type.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesFunding = 
                fundingFilter === 'ALL' ||
                (fundingFilter === 'FULL' && item.funding_type?.toLowerCase().includes('full')) ||
                (fundingFilter === 'PARTIAL' && item.funding_type?.toLowerCase().includes('partial'));

            const deadlineInfo = getDeadlineStatus(item.application_deadline);
            const matchesStatus = 
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && (deadlineInfo.color === 'emerald' || deadlineInfo.color === 'amber')) ||
                (statusFilter === 'EXPIRED' && deadlineInfo.color === 'red');

            return matchesSearch && matchesFunding && matchesStatus;
        });
    }, [scholarships, searchTerm, fundingFilter, statusFilter]);

    // Metrics summary
    const stats = useMemo(() => {
        const total = scholarships.length;
        let active = 0;
        let fullyFunded = 0;

        scholarships.forEach(s => {
            const status = getDeadlineStatus(s.application_deadline);
            if (status.color === 'emerald' || status.color === 'amber') active++;
            if (s.funding_type?.toLowerCase().includes('full')) fullyFunded++;
        });

        return { total, active, fullyFunded };
    }, [scholarships]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading scholarships...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Error loading scholarships</h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">Please refresh or check your API connection.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        Scholarships Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Manage global scholarship programs, application deadlines, and linked news posts.
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                >
                    <Plus size={18} />
                    <span>New Scholarship</span>
                </button>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Programs</div>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Deadlines</div>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.fullyFunded}</div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fully Funded</div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search title, country, degree, funding..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mr-1">
                        <Filter className="w-3.5 h-3.5" /> Filter:
                    </div>
                    
                    {/* Funding Filter */}
                    <select
                        value={fundingFilter}
                        onChange={(e) => setFundingFilter(e.target.value)}
                        className="py-1.5 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="ALL">All Funding</option>
                        <option value="FULL">Fully Funded</option>
                        <option value="PARTIAL">Partially Funded</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-1.5 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="ALL">All Deadlines</option>
                        <option value="ACTIVE">Active</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                </div>
            </div>

            {/* Redesigned Table View */}
            <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Scholarship Program
                                </th>
                                <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Location & Level
                                </th>
                                <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Funding & IELTS
                                </th>
                                <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                    Deadline & Status
                                </th>
                                <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredScholarships.map((scholarship) => {
                                const deadlineStatus = getDeadlineStatus(scholarship.application_deadline);
                                const isSourceUrl = scholarship.source?.startsWith('http');

                                return (
                                    <tr key={scholarship.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors">
                                        {/* Scholarship Title & Linked Post */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                                    {scholarship.feature_image ? (
                                                        <img src={scholarship.feature_image} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <GraduationCap className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                                                        {scholarship.title}
                                                    </div>
                                                    
                                                    {/* Linked Post Badge */}
                                                    {scholarship.post ? (
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                                                            <FileText size={12} />
                                                            <span className="truncate max-w-[240px]">Post #{scholarship.post.id}: {scholarship.post.title}</span>
                                                        </div>
                                                    ) : scholarship.reference_post_id ? (
                                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                            <FileText size={12} />
                                                            <span>Linked Post #{scholarship.reference_post_id}</span>
                                                        </div>
                                                    ) : null}

                                                    {/* Last Verified Date */}
                                                    {scholarship.last_verified_date && (
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                                            <span>Verified: {new Date(scholarship.last_verified_date).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Location & Degree Level */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    <Globe size={14} className="text-blue-500 flex-shrink-0" />
                                                    <span>{scholarship.country || 'Global'}</span>
                                                </div>
                                                {scholarship.degree_level && (
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                        <GraduationCap size={12} />
                                                        <span>{scholarship.degree_level}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Funding & IELTS */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1.5">
                                                <div>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                        scholarship.funding_type?.toLowerCase().includes('full')
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                                                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                                                    }`}>
                                                        <Sparkles size={11} />
                                                        {scholarship.funding_type || 'Unspecified'}
                                                    </span>
                                                </div>

                                                {scholarship.ielts_required && (
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                        <span className="font-semibold text-gray-500">IELTS:</span>
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">{scholarship.ielts_required}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Deadline & Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white font-medium">
                                                    <Calendar size={14} className="text-indigo-500" />
                                                    <span>
                                                        {scholarship.application_deadline
                                                            ? new Date(scholarship.application_deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                                            : 'Open / Flexible'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                                                        deadlineStatus.color === 'emerald'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                                            : deadlineStatus.color === 'amber'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                                                            : deadlineStatus.color === 'red'
                                                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
                                                            : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                    }`}>
                                                        <Clock size={11} />
                                                        {deadlineStatus.label}
                                                    </span>

                                                    {/* Source Link */}
                                                    {scholarship.source && (
                                                        isSourceUrl ? (
                                                            <a
                                                                href={scholarship.source}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                                title={`Source: ${scholarship.source}`}
                                                            >
                                                                <ExternalLink size={14} />
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 truncate max-w-[100px]" title={scholarship.source}>
                                                                {scholarship.source}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(scholarship.id)}
                                                    className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/50 transition-colors"
                                                    title="Edit Scholarship"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(scholarship.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 transition-colors"
                                                    title="Delete Scholarship"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredScholarships.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="max-w-sm mx-auto space-y-2">
                                            <GraduationCap className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
                                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">No scholarships found</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {searchTerm || fundingFilter !== 'ALL' || statusFilter !== 'ALL'
                                                    ? 'Try adjusting your search query or filters.'
                                                    : 'Get started by creating your first scholarship program.'}
                                            </p>
                                            {!(searchTerm || fundingFilter !== 'ALL' || statusFilter !== 'ALL') && (
                                                <button
                                                    onClick={handleCreate}
                                                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                                >
                                                    <Plus size={14} /> Create Scholarship
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer with count */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>Showing {filteredScholarships.length} of {scholarships.length} scholarships</span>
                </div>
            </div>
        </div>
    );
}

