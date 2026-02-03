'use client';
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import { BASE_URL } from "@/config/config";
import UserEditModal from "./UserEditModal";
import { useAuth } from "@/context/AuthContext";

import { Edit2, Trash2, Ban } from 'lucide-react';
import { User } from '@/types/user';




interface ApiResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authFetch, user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await authFetch(BASE_URL + 'admin/user', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setUsers(data.data.users);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleUserSave = (updatedUser: User) => {
    setUsers(prev => prev.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    ));
  };



  const getStatusColor = (status: string) => {
    if (!status) return 'success';
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
      case 'cancel':
        return 'error';
      default:
        return 'success';
    }
  };

  const getProfileImage = (profileImage: string | null, name: string) => {
    if (profileImage) {
      // Handle both full URLs and relative paths
      if (profileImage.startsWith('http')) {
        return profileImage;
      } else {
        return `http://newsapi.test/storage/images/${profileImage}`;
      }
    }
    // Return a default avatar or placeholder
    return '/images/user/avatar-placeholder.png';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async (userId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');

      const response = await authFetch(`${BASE_URL}admin/user/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        // alert('User deleted successfully');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error deleting user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status?.toLowerCase() === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'inactive' ? 'deactivate' : 'activate';

    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');

      // Try specific endpoint first
      const response = await authFetch(`${BASE_URL}admin/user/${user.id}/${action}`, {
        method: 'POST',
      });

      // Fallback: update user status directly
      if (response.status === 404) {
        const updateResponse = await authFetch(`${BASE_URL}admin/user/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });

        if (updateResponse.ok) {
          // Update local state immediately
          setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
          alert(`User ${action}d successfully`);
          return;
        }
      }

      if (response.ok) {
        // Update local state immediately instead of refetching
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        alert(`User ${action}d successfully`);
      } else {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${action} user`);
      }
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      alert(`Failed to ${action} user. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-red-200 bg-red-50 dark:border-red-800/20 dark:bg-red-900/10">
        <div className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Last Login
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start min-w-60 ">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={getProfileImage(user.profile_image, user.name)}
                          alt={user.name}
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {user.phone || 'No phone'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {user.user_role}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={getStatusColor(user.status || 'active')}
                    >
                      {user.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-xs dark:text-gray-400">
                    {user.last_login_at ? formatDate(user.last_login_at) : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500">
                    <div className="flex items-center gap-2">
                      {currentUser && currentUser.id !== user.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-green-500 hover:text-green-600 p-1"
                            title="Edit User"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={user.status?.toLowerCase() === 'active' ? 'text-orange-500 hover:text-orange-600 p-1' : 'text-green-500 hover:text-green-600 p-1'}
                            title={user.status?.toLowerCase() === 'active' ? 'Deactivate User' : 'Activate User'}
                          >
                            <Ban size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-500 hover:text-red-600 p-1"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Current User</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Modal Component */}
      <UserEditModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleUserSave}
      />
    </>
  );
}