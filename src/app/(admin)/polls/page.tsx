"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PollForm from "@/components/polls/PollForm";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/config";

export default function PollsPage() {
    const { authFetch } = useAuth();
    const [polls, setPolls] = useState<any[]>([]); // Use appropriate type if available
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState(null);

    const fetchPolls = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`${BASE_URL}admin/polls`);
            const data = await res.json();

            if (res.ok && data.success) {
                // Adjust based on your API response structure (paginate vs all)
                setPolls(data.data.data || data.data);
            } else {
                // toast.error("Failed to load polls"); // Optional: suppress if it's just empty or 404 handled elsewhere
            }
        } catch (error) {
            console.error("Failed to fetch polls:", error);
            toast.error("Failed to load polls");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this poll?")) return;

        try {
            const res = await authFetch(`${BASE_URL}admin/polls/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Poll deleted successfully");
                fetchPolls();
            } else {
                toast.error("Failed to delete poll");
            }

        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete poll");
        }
    };

    const handleEdit = (poll: any) => {
        setSelectedPoll(poll);
        setOpenDialog(true);
    };

    const handleCreate = () => {
        setSelectedPoll(null);
        setOpenDialog(true);
    };

    const handleSuccess = () => {
        setOpenDialog(false);
        fetchPolls();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Poll Management</h1>
                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Create Poll
                </Button>
            </div>

            <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden shadow-sm">
                <Table className="w-full text-left border-collapse">
                    <TableHeader className="bg-gray-50 dark:bg-gray-700/50">
                        <TableRow className="border-b dark:border-gray-700">
                            <TableCell isHeader className="p-4 font-semibold text-gray-900 dark:text-white">ID</TableCell>
                            <TableCell isHeader className="p-4 font-semibold text-gray-900 dark:text-white">Question</TableCell>
                            <TableCell isHeader className="p-4 font-semibold text-gray-900 dark:text-white text-center">Status</TableCell>
                            <TableCell isHeader className="p-4 font-semibold text-gray-900 dark:text-white text-center">Total Votes</TableCell>
                            <TableCell isHeader className="p-4 font-semibold text-gray-900 dark:text-white text-right">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell className="p-8 text-center" >
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : polls.length === 0 ? (
                            <TableRow>
                                <TableCell className="p-8 text-center text-gray-500">
                                    No polls found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            polls.map((poll) => (
                                <TableRow key={poll.id} className="border-b last:border-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <TableCell className="p-4 text-gray-700 dark:text-gray-300">{poll.id}</TableCell>
                                    <TableCell className="p-4 text-gray-700 dark:text-gray-300 max-w-xs truncate" >
                                        {poll.question}
                                    </TableCell>
                                    <TableCell className="p-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${poll.is_active
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                            }`}>
                                            {poll.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="p-4 text-center text-gray-700 dark:text-gray-300">{poll.total_votes || 0}</TableCell>
                                    <TableCell className="p-4 text-right">
                                        <div className="flex justify-end gap-2 text-right">
                                            <button
                                                onClick={() => handleEdit(poll)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(poll.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal isOpen={openDialog} onClose={() => setOpenDialog(false)} className="max-w-4xl p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedPoll ? "Edit Poll" : "Create New Poll"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {selectedPoll ? "Update changes to the poll." : "Create a new poll for the audience."}
                    </p>
                </div>
                <PollForm
                    poll={selectedPoll}
                    onSuccess={handleSuccess}
                    onCancel={() => setOpenDialog(false)}
                />
            </Modal>
        </div>
    );
}
