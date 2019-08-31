import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Hand from './hand/Hand';
import Session from './session/Session';

export default function Main() {
  return (
    <Switch>
      <Route exact path="/" render={(props) => (
        // TODO: this can remove "exact" and handle all logic for sending to session or hand if applicable
        <Redirect to="/hand/actions"/>
      )}/>
      <Route path="/hand" component={Hand} />
      <Route exact path="/session" component={Session} />
    </Switch>
  );
}