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
// TODO: material ui setup reccomends adding a meta tag in the index.html for responsiveness that's slightly different than current tag.
export default App;
