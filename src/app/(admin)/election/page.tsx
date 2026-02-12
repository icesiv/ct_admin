"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/config";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ElectionResultPage() {
    const { authFetch } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initial state matching the default structure
    const [partyData, setPartyData] = useState({
        labels: [] as string[],
        datasets: [{
            data: [] as number[],
            backgroundColor: [] as string[],
            borderColor: [] as string[],
            borderWidth: 2
        }]
    });

    const [referendumData, setReferendumData] = useState({
        yes: 0,
        no: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`${BASE_URL}settings/election-results`);
            const Result = await res.json();

            if (res.ok && Result) {
                // Ensure we have the structure we expect
                if (Result.partyData) setPartyData(Result.partyData);
                if (Result.referendumData) setReferendumData(Result.referendumData);
            }
        } catch (error) {
            console.error("Failed to fetch election results:", error);
            toast.error("Failed to load election results");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePartyDataChange = (index: number, value: string | number, field: 'label' | 'data') => {
        const newPartyData = { ...partyData };
        if (field === 'label') {
            newPartyData.labels[index] = value as string;
        } else {
            newPartyData.datasets[0].data[index] = Number(value);
        }
        setPartyData(newPartyData);
    };

    const handleReferendumChange = (field: 'yes' | 'no', value: string) => {
        setReferendumData(prev => ({
            ...prev,
            [field]: Number(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                partyData,
                referendumData
            };

            const res = await authFetch(`${BASE_URL}admin/settings/election-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Election results updated successfully");
            } else {
                toast.error(data.message || "Failed to update results");
            }
        } catch (error) {
            console.error("Failed to update results:", error);
            toast.error("Failed to update results");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Election Results Management</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Party Data Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Parliament & Party Data</h2>

                    <div className="space-y-4">
                        {partyData.labels.map((label, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-1 flex justify-center">
                                    <div
                                        className="w-6 h-6 rounded-full border border-gray-200"
                                        style={{ backgroundColor: partyData.datasets[0].backgroundColor[index] }}
                                    />
                                </div>
                                <div className="col-span-5">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Party Name</label>
                                    <input
                                        type="text"
                                        value={label}
                                        onChange={(e) => handlePartyDataChange(index, e.target.value, 'label')}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900"
                                    />
                                </div>
                                <div className="col-span-6">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Seat Count</label>
                                    <input
                                        type="number"
                                        value={partyData.datasets[0].data[index]}
                                        onChange={(e) => handlePartyDataChange(index, e.target.value, 'data')}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Referendum Data Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Referendum Result</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yes Votes</label>
                            <input
                                type="number"
                                value={referendumData.yes}
                                onChange={(e) => handleReferendumChange('yes', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No Votes</label>
                            <input
                                type="number"
                                value={referendumData.no}
                                onChange={(e) => handleReferendumChange('no', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
