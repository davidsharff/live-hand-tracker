import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import Hand from './hand/Hand';
import Session from "./session/Session";

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={(props) => (
          // TODO: currently hand will handle redirecting to session if it hasn't been created yet. Should we send to /session instead?
          <Redirect to="/hand"/>
        )}/>
        <Route exact path="/hand" component={Hand} />
        <Route exact path="/session" component={Session} />
      </Switch>
    </Router>
  );
}