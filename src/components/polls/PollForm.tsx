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
        options: poll?.options?.map((o: any) => o.option_text) || ["", ""], // Default 2 empty options
    });

    const handleImageSelect = (image: ImageData) => {
        setFormData({ ...formData, image: image.url });
        setIsOpen(false);
    };

    const OpenModal = (flag: boolean) => setIsOpen(flag);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        if (formData.options.length < 6) {
            setFormData({ ...formData, options: [...formData.options, ""] });
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

        // Simple validation
        if (formData.options.some((opt: string) => !opt.trim())) {
            toast.error("Please fill in all options");
            setLoading(false);
            return;
        }

        try {
            const url = poll
                ? `${BASE_URL}admin/polls/${poll.id}`
                : `${BASE_URL}admin/polls`;

            const method = poll ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(poll ? "Poll updated successfully" : "Poll created successfully");
                onSuccess();
            } else {
                toast.error(data.message || "Failed to save poll");
            }
        } catch (error) {
            console.error("Poll save error:", error);
            toast.error("Failed to save poll");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="question">Question</Label>
                <textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500"
                />
            </div>

            <div>
                <FeatureImageUploader
                    featured_image={formData.image}
                    title="Poll Image (Optional)"
                    OpenModal={OpenModal}
                />
            </div>

            <div>
                <Label>Options (Min 2, Max 6)</Label>
                <div className="space-y-2 mt-1">
                    {formData.options.map((option: string, index: number) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={option}
                                onChange={(e: any) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                required
                            />
                            {formData.options.length > 2 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeOption(index)}
                                    className="px-3"
                                >
                                    ✕
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
                {formData.options.length < 6 && (
                    <Button type="button" variant="outline" onClick={addOption} className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                        + Add Option
                    </Button>
                )}
            </div>

            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <Label htmlFor="is_active" className="!mb-0">Active Poll?</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} startIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}>
                    {poll ? "Update Poll" : "Create Poll"}
                </Button>
            </div>


            <ImageUploaderModal
                isOpen={isOpen}
                OpenModal={OpenModal}
                callback={handleImageSelect}
                uploadEndpoint="admin/polls/upload-image"
                fetchEndpoint="admin/images/upload-image/gallery" // Use existing gallery for fetching
            />
        </form >
    );
}
