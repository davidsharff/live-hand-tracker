import React, { useEffect } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';

import Slide from '@material-ui/core/Slide';

import Header from '../components/Header';
import Session from './session/SessionConnector';
import Hand from './hand/HandWizardConnector';

import localActionTypes from '../redux/localActionTypes';

function Main(props) {
  const { authToken, dispatch } = props;

  useEffect(() => {
    if (authToken === null) {
      // TODO: replace with call to server or redirect since sign-in component will likely handle setting authToken
      dispatch({
        type: localActionTypes.SET_AUTH_TOKEN,
        payload: {
          authToken: Math.round(Math.random() * 100000) + ''
        }
      });
    } else if (!localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', authToken);
    }
  }, [authToken, dispatch]);

  if (authToken === null) {
    // TODO: replace with redirect.
    return <div>Loading...</div>;
  }

  const { location: { pathname }, sessionLocation, history } = props;
  const isSessionRoute = _.includes(pathname, 'session');
  return (
    <React.Fragment>
      <Header
        mainLabel={isSessionRoute ? 'Session' : 'Hand #1'}
        subLabel={!isSessionRoute && sessionLocation }
        onGoBack={() => history.push('/session/')}
      />
      <Switch>
        <Route exact path="/" render={(props) => (
          // TODO: this can remove "exact" and handle all logic for sending to session or hand if applicable
          <Redirect to="/hand/actions"/>
        )}/>
        <Route path="/hand" render={() =>
          <Slide
            in={true}
            direction="up"
            style={{ transformOrigin: '0 0 0' }}
            timeout={500}
          >
            <div style={{ height: '100%'}}>
              <Hand />
            </div>
          </Slide>
        }/>
        <Route exact path="/session" component={Session}/>
      </Switch>
    </React.Fragment>
  );
}

export default withRouter(connect(state => ({
  sessionLocation: state.session && state.session.location,
  authToken: state.local.authToken
}))(Main));

