import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import store from './redux/store';
import Main from './containers/Main';

const theme = createMuiTheme({});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
// TODO: material ui setup reccomends adding a meta tag in the index.html for responsiveness that's slightly different than current tag.
export default App;
