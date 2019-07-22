import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import actionMiddleware  from './middleware/actionMiddleware';

import combinedReducer from './reducers';

export default composeWithDevTools(applyMiddleware(actionMiddleware))(createStore)(combinedReducer);