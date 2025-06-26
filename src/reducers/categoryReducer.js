export const categoryReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CATEGORY_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_CATEGORY_data':
            return {
                ...state,
                data: action.payload
            };
        case 'SET_CATEGORY_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'CLEAR_CATEGORY_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};