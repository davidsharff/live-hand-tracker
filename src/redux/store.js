import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import actionMiddleware  from './middleware/actionMiddleware';
import apiMiddleware from './middleware/apiMiddleware';

import combinedReducer from './reducers';

export default composeWithDevTools(applyMiddleware(actionMiddleware, apiMiddleware))(createStore)(combinedReducer);