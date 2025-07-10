
// src/reducers/index.ts
import { authReducer } from './authReducer';
import { categoriesReducer } from './categoryReducer'; // Fixed: import categoriesReducer, not categoryReducer

// Type-safe combineReducers implementation
const combineReducers = (reducers: Record<string, any>) => {
  return (state: any = {}, action: any) => {
    const newState: Record<string, any> = {};
    for (let key in reducers) {
      newState[key] = reducers[key](state[key], action);
    }
    return newState;
  };
};

export const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer
});

// Export the root state type
export type RootState = ReturnType<typeof rootReducer>;