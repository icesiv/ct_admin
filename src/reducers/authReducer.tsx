// src/reducers/authReducer.ts
const initialAuthState = {
    user: null,
    loading: true,
    isAuthenticated: false,
    error: null,
    showLogin: false
};

export const authReducer = (state = initialAuthState, action: any) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                loading: false
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null
            };
        case 'SHOW_LOGIN':
            return { ...state, showLogin: action.payload };
        default:
            return state;
    }
};