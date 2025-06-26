"use client"
import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { BASE_URL } from '../config/config';
import { rootReducer } from '../reducers';

// Types
interface User {
    id: string | number;
    name: string;
    email: string;
    // Add other user properties as needed
}

interface AuthState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    error: Record<string, string> | null;
    showLogin: boolean;
}

interface Category {
    id: string | number;
    name: string;
    // Add other category properties as needed
}

interface CategoriesState {
    data: {
        data?: Category[];
    } | Category[];
}

interface RootState {
    auth: AuthState;
    categories: CategoriesState;
}

interface LoginCredentials {
    email: string;
    password: string;
    // Add other credential fields as needed
}

interface LoginResponse {
    success: boolean;
    errors?: Record<string, string>;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    error: Record<string, string> | null;
    showLogin: boolean;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    handleLogout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    clearError: () => void;
    setShowLogin: (show: boolean) => void;
    router: AppRouterInstance;
    fetcCategories: () => Promise<void>;
    news_categories: Category[];
    savePost: (data: any) => Promise<any>;
}

interface AuthProviderProps {
    children: ReactNode;
}

// Create context with proper typing
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialStateAuth: AuthState = {
    user: null,
    loading: true,
    isAuthenticated: false,
    error: null,
    showLogin: false
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const router = useRouter();
    const [state, dispatch] = useReducer(rootReducer, {
        auth: initialStateAuth,
        categories: { data: [] }
    } as RootState);

    const { user, loading, isAuthenticated, error, showLogin } = state.auth;
    const { data } = state.categories;

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
        fetcCategories();
        fetchUser();
    }, []);

    // Fetch user if authenticated but no user data
    useEffect(() => {
        if (isAuthenticated && !user) {
            fetchUser();
        }
    }, [isAuthenticated, user]);

    const checkAuth = async (): Promise<void> => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        try {
            await fetchUser();
        } catch (error) {
            handleLogout();
        }
    };

    const fetchUser = async (): Promise<void> => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await fetch(`${BASE_URL}user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const userData: User = await response.json();
                dispatch({ type: 'SET_USER', payload: userData });
            } else {
                throw new Error('Failed to fetch user');
            }
        } catch (error) {
            console.error('Fetch user error:', error);
            handleLogout();
        }
    };

    const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            dispatch({ type: 'CLEAR_ERROR' });
            dispatch({ type: 'SET_LOADING', payload: true });

            const response = await fetch(`${BASE_URL}login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('auth_token', data.token);

                // Set user data
                dispatch({ type: 'SET_USER', payload: data.user });

                return { success: true };
            } else {
                dispatch({ type: 'SET_ERROR', payload: data.errors || { general: data.message } });
                return { success: false, errors: data.errors || { general: data.message } };
            }
        } catch (error) {
            const errorMsg = { general: 'Network error. Please try again.' };
            dispatch({ type: 'SET_ERROR', payload: errorMsg });
            return { success: false, errors: errorMsg };
        }
    };

    const handleLogout = async (): Promise<void> => {
        const token = localStorage.getItem('auth_token');

        try {
            if (token) {
                await fetch(`${BASE_URL}logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and state
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
            router.push('/login');
        }
    };

    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const setShowLogin = (show: boolean): void => {
        dispatch({ type: 'SHOW_LOGIN', payload: show });
    };

    const fetcCategories = async (): Promise<void> => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: false });
            return;
        }

        try {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: true });
            const response = await fetch(`${BASE_URL}admin/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'SET_CATEGORY_data', payload: data });
                dispatch({ type: 'SET_CATEGORY_LOADING', payload: false });
            } else {
                throw new Error('Failed to fetch categories');
            }
        } catch (error) {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: false });
            console.error('Fetch category error:', error);
            // handleLogout();
        }
    };

    const savePost = async (data: any): Promise<any> => {
        const token = localStorage.getItem('auth_token');

        try {
            if (token) {
                const resp = await fetch(`${BASE_URL}admin/posts/store`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                return resp.json();
            }
        } catch (error) {
            console.error('Save post error:', error);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated,
        error,
        showLogin,
        login,
        handleLogout,
        fetchUser,
        clearError,
        setShowLogin,
        router,
        fetcCategories,
        news_categories: Array.isArray(data) ? data : (data?.data ? data.data : []),
        savePost,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};