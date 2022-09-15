import { combineReducers } from 'redux';
import authReducer from './auth/reducer';

const reducer = (state = { app: 'init', page: 'init' }, action) => {
  switch (action.type) {
      case 'HYDRATE':
          if (action.payload.app === 'init') delete action.payload.app;
          if (action.payload.page === 'init') delete action.payload.page;
          return state;
      case 'APP':
          return { ...state, app: action.payload };
      case 'PAGE':
          return { ...state, page: action.payload };
      default:
          return state;
  }
};


export default  combineReducers({
  wrapper: reducer,
  auth: authReducer
});