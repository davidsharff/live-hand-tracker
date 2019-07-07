import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import Hand from './hand/Hand';

export default function Views() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={(props) => (
          <Redirect to="/hand"/>
        )}/>
        <Route exact path="/hand" component={Hand}/>
      </Switch>
    </Router>
  );
}