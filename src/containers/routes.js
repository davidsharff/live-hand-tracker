import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import CreateHand from './create-hand/CreateHand';

export default function Views() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={(props) => (
          <Redirect to="/create-hand"/>
        )}/>
        <Route exact path="/create-hand" component={CreateHand}/>
      </Switch>
    </Router>
  );
}