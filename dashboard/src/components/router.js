import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';
import AccelerometerChart from './accelerometer-chart';
import App from './app';

const RouterComponent = () => (
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRedirect to="/accelerometer" />
      <Route path="accelerometer" component={AccelerometerChart} />
    </Route>
  </Router>
);

export default RouterComponent;
