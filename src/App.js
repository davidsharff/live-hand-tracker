import React from 'react';
import { Provider } from 'react-redux';

import store from './redux/store';

import Views from './containers/routes';

function App() {
  return (
    <Provider store={store}>
      <Views />
    </Provider>
  );
}

export default App;
