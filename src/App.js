import React from 'react';
import { Provider } from 'react-redux';

import store from './redux/store';

import ContainerRoutes from './containers/ContainerRoutes';

function App() {
  return (
    <Provider store={store}>
      <ContainerRoutes />
    </Provider>
  );
}

export default App;
