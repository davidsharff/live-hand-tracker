import React from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';

import Slide from '@material-ui/core/Slide';

import Header from '../components/Header';
import Session from './session/Session';
import Hand from './hand/Hand';

function Main(props) {
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
  sessionLocation: state.session && state.session.location
}))(Main));

