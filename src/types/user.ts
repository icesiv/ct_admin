export interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  user_role: string;
  profile_image: string | null;
  status?: 'active' | 'inactive';
  last_login_at?: string | null;
  created_at: string;
}