import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import handMiddleware  from './middleware/handMiddleware';

import combinedReducer from './reducers';

export default composeWithDevTools(applyMiddleware(handMiddleware))(createStore)(combinedReducer);