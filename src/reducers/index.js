import {authReducer} from './authReducer';
import {categoryReducer} from './categoryReducer';
const combineReducers = (reducers) => {
  return (state, action) => {
    const newState = {};
    for (let key in reducers) {
      newState[key] = reducers[key](state[key], action);
    }
    return newState;
  };
};

export const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoryReducer
});
