export interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  is_super_admin: boolean;
  profile_image: string | null;
  status?: 'active' | 'inactive';
  assigned_menus?: string[];
  last_login_at?: string | null;
  created_at: string;
}