import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';
import AccelerometerChart from './accelerometer-chart';
import TemperatureChart from './temperature-chart';
import Main from './main';

const RouterComponent = () => (
    <Router history={hashHistory}>
        <Route path="/" component={Main}>
            <IndexRedirect to="/accelerometer" />
            <Route path="accelerometer" component={AccelerometerChart} />
            <Route path="temperature" component={TemperatureChart} />
        </Route>
    </Router>
);

export default RouterComponent;
