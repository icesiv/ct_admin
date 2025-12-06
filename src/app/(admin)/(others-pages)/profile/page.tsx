// src/pages/Profile.tsx
'use client';
import UserInfoCard from '@/components/user-profile/UserInfoCard';
// import UserMetaCard from '@/components/user-profile/UserMetaCard';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { User } from '@/types/user';

// Define the AuthUser type
interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  user_role?: string;
  profile_image?: string | null;
  created_at: string | Date;
}

export default function Profile() {
  const { user } = useAuth() as { user: AuthUser | null };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  // Normalize AuthUser to User
  const normalizedUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    user_role: user.user_role ?? 'user', // Default to 'user'
    profile_image: user.profile_image ?? null,
    created_at: typeof user.created_at === 'string' ? user.created_at : user.created_at.toISOString(),
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          {/* <UserMetaCard user={normalizedUser} /> */}
          <UserInfoCard user={normalizedUser} />
        </div>
      </div>
    </div>
  );
}