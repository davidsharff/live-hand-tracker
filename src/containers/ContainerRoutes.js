import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import Hand from './hand/Hand';
import Session from "./session/Session";

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={(props) => (
          // TODO: this can remove "exact" and handle all logic for sending to session or hand if applicable
          <Redirect to="/hand"/>
        )}/>
        <Route path="/hand" component={Hand} />
        <Route exact path="/session" component={Session} />
      </Switch>
    </Router>
  );
}