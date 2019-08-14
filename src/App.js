import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import store from './redux/store';
import ContainerRoutes from './containers/ContainerRoutes';

const theme = createMuiTheme({});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ContainerRoutes />
      </ThemeProvider>
    </Provider>
  );
}
// TODO: material ui setup reccomends adding a meta tag in the index.html for responsiveness that's slightly different than current tag.
export default App;
