'use client';

import React, { useState } from 'react';
import { AdPosition, useAdPositions } from '@/hooks/useAdPositions';
import { Advertisement } from '@/types/ads';
import { Plus, Trash2, Edit3, Check, X, RotateCcw, Copy, Layers } from 'lucide-react';

interface AdPositionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingAds?: Advertisement[];
}

export default function AdPositionsModal({ isOpen, onClose, existingAds = [] }: AdPositionsModalProps) {
    const { positions, addPosition, updatePosition, deletePosition, resetToDefaults } = useAdPositions(existingAds);

    const [newKey, setNewKey] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Editing state
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ key: string; label: string; description: string }>({
        key: '',
        label: '',
        description: ''
    });

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const result = addPosition({
            key: newKey,
            label: newLabel,
            description: newDescription
        });

        if (!result.success) {
            setError(result.error || 'Failed to add position.');
            return;
        }

        setNewKey('');
        setNewLabel('');
        setNewDescription('');
    };

    const startEditing = (pos: AdPosition) => {
        setEditingKey(pos.key);
        setEditForm({
            key: pos.key,
            label: pos.label,
            description: pos.description || ''
        });
        setError(null);
    };

    const cancelEditing = () => {
        setEditingKey(null);
        setError(null);
    };

    const handleSaveEdit = (originalKey: string) => {
        setError(null);
        const result = updatePosition(originalKey, editForm);
        if (!result.success) {
            setError(result.error || 'Failed to update position.');
            return;
        }
        setEditingKey(null);
    };

    const handleDelete = (key: string) => {
        const adsUsingPosition = existingAds.filter(a => a.position === key);
        if (adsUsingPosition.length > 0) {
            const confirmMsg = `There are ${adsUsingPosition.length} advertisement(s) currently using "${key}". Are you sure you want to remove this position from the list?`;
            if (!window.confirm(confirmMsg)) return;
        }
        deletePosition(key);
    };

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };

    const getAdCountForPosition = (key: string) => {
        return existingAds.filter(ad => ad.position === key).length;
    };

    return (
        <div className="p-6 max-h-[85vh] flex flex-col space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Layers size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Ad Positions</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Configure placement identifiers (e.g. <code>ad-details-2</code>) available for ads across templates.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Add New Position Form */}
            <form onSubmit={handleAdd} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Add New Position
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Position Key <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. ad-details-2"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            required
                            className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Display Label
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Details Ad 2"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Description (Optional)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. Middle of article body"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shrink-0 transition"
                            >
                                <Plus size={16} />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Existing Positions List */}
            <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Identifier (Key)
                            </th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Display Label & Description
                            </th>
                            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Active Ads
                            </th>
                            <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {positions.map((pos) => {
                            const isEditing = editingKey === pos.key;
                            const adCount = getAdCountForPosition(pos.key);

                            if (isEditing) {
                                return (
                                    <tr key={pos.key} className="bg-indigo-50/50 dark:bg-indigo-950/20">
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={editForm.key}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                                className="w-full text-xs font-mono px-2 py-1 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                            />
                                        </td>
                                        <td className="px-4 py-3 space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Label"
                                                value={editForm.label}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                                                className="w-full text-xs px-2 py-1 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full text-xs px-2 py-1 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                                            {adCount}
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleSaveEdit(pos.key)}
                                                    className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                                                    title="Save"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                    title="Cancel"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={pos.key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700/70 text-indigo-700 dark:text-indigo-300 rounded border border-gray-200 dark:border-gray-600">
                                                {pos.key}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(pos.key)}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                                title="Copy position key"
                                            >
                                                {copiedKey === pos.key ? (
                                                    <Check size={13} className="text-green-500" />
                                                ) : (
                                                    <Copy size={13} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {pos.label}
                                        </div>
                                        {pos.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {pos.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            adCount > 0
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                            {adCount} {adCount === 1 ? 'ad' : 'ads'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => startEditing(pos)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                                                title="Edit position"
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pos.key)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                                title="Delete position"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {positions.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No ad positions configured.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm('Reset ad positions back to standard defaults? Any custom positions will be cleared.')) {
                            resetToDefaults();
                        }
                    }}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                >
                    <RotateCcw size={14} />
                    <span>Reset to Defaults</span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
