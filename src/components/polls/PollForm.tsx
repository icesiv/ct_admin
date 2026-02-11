"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/config";
import { FeatureImageUploader } from "@/components/editor/FeatureUploader";
import ImageUploaderModal, { ImageData } from "@/app/(admin)/(others-pages)/posts/create/component/Gallery/ImageUploaderModal";

// Simple Label Component
const Label = ({ children, htmlFor, className = "" }: any) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}>
        {children}
    </label>
);

// Simple Input Component
const Input = (props: any) => (
    <input
        {...props}
        className={`w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 ${props.className || ""}`}
    />
);

export default function PollForm({ poll, onSuccess, onCancel }: any) {
    const { authFetch } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        question: poll?.question || "",
        image: poll?.image || "",
        is_active: poll?.is_active ?? true,
        options: poll?.options?.map((o: any) => ({
            text: o.option_text,
            vote_count: o.vote_count || 0
        })) || [
                { text: "", vote_count: 0 },
                { text: "", vote_count: 0 }
            ],
    });

    const handleImageSelect = (image: ImageData) => {
        setFormData({ ...formData, image: image.url });
        setIsOpen(false);
    };

    const OpenModal = (flag: boolean) => setIsOpen(flag);

    const handleOptionChange = (index: number, field: 'text' | 'vote_count', value: string | number) => {
        const newOptions = [...formData.options];
        if (field === 'vote_count') {
            const numVal = value === '' ? 0 : parseInt(value.toString());
            newOptions[index] = { ...newOptions[index], [field]: isNaN(numVal) ? 0 : numVal };
        } else {
            newOptions[index] = { ...newOptions[index], [field]: value };
        }
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        if (formData.options.length < 6) {
            setFormData({ ...formData, options: [...formData.options, { text: "", vote_count: 0 }] });
        }
    };

    const removeOption = (index: number) => {
        if (formData.options.length > 2) {
            const newOptions = formData.options.filter((_: any, i: number) => i !== index);
            setFormData({ ...formData, options: newOptions });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (formData.options.some((opt: any) => !opt?.text?.trim())) {
            toast.error("Please fill in all option texts");
            setLoading(false);
            return;
        }

        try {
            const url = poll
                ? `${BASE_URL}admin/polls/${poll.id}`
                : `${BASE_URL}admin/polls`;

            const method = poll ? 'PUT' : 'POST';

            // Transform options to API format
            const payload = {
                ...formData,
                options: formData.options.map((opt: any) => ({
                    option_text: opt.text,
                    vote_count: parseInt(opt.vote_count) || 0
                }))
            };

            const res = await authFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(poll ? "Poll updated successfully" : "Poll created successfully");
                onSuccess();
            } else {
                // Handle validation errors or generic message
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    toast.error(Array.isArray(firstError) ? firstError[0] : "Validation failed");
                } else {
                    toast.error(data.message || "Failed to save poll");
                }
            }
        } catch (error) {
            console.error("Poll save error:", error);
            toast.error("Failed to save poll");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Column: Basic Information */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-brand-500 rounded-full"></span>
                            Basic Details
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="question">Poll Question</Label>
                                <textarea
                                    id="question"
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    required
                                    rows={4}
                                    placeholder="What would you like to ask?"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <Label>Feature Image</Label>
                                <FeatureImageUploader
                                    featured_image={formData.image}
                                    title="Upload Poll Image"
                                    OpenModal={OpenModal}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <Label htmlFor="is_active" className="!mb-0 cursor-pointer">Active Poll</Label>
                                <div className="relative inline-flex items-center cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className={`w-11 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-gray-600 rounded-full h-5 w-5 transition-transform ${formData.is_active ? 'translate-x-full' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Poll Options */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Poll Options
                            </h3>
                            <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                                {formData.options.length} / 6 Options
                            </span>
                        </div>

                        <div className="space-y-3">
                            {formData.options.map((option: any, index: number) => (
                                <div key={index} className="group flex gap-3 items-start p-3 rounded-lg border border-gray-100 dark:border-gray-700/50 hover:border-brand-200 dark:hover:border-brand-500/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 mt-2.5 shrink-0">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2">
                                            <Label className="text-xs text-gray-500 mb-1.5">Option Text</Label>
                                            <Input
                                                value={option.text}
                                                onChange={(e: any) => handleOptionChange(index, 'text', e.target.value)}
                                                placeholder={`Enter option ${index + 1}...`}
                                                required
                                                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1.5">Initial Votes</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={option.vote_count}
                                                onChange={(e: any) => handleOptionChange(index, 'vote_count', e.target.value)}
                                                placeholder="0"
                                                className="text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600"
                                            />
                                        </div>
                                    </div>

                                    {formData.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="mt-8 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                            title="Remove option"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {formData.options.length < 6 && (
                            <button
                                type="button"
                                onClick={addOption}
                                className="mt-4 w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all group"
                            >
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 group-hover:bg-brand-100 text-gray-500 group-hover:text-brand-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                </span>
                                Add Another Option
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="min-w-[100px]">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} startIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} className="min-w-[140px]">
                    {poll ? "Update Poll" : "Create Poll"}
                </Button>
            </div>

            <ImageUploaderModal
                isOpen={isOpen}
                OpenModal={OpenModal}
                callback={handleImageSelect}
                uploadEndpoint="admin/polls/upload-image"
                fetchEndpoint="admin/images/upload-image/gallery"
            />
        </form>
    );
}
