import React, { Component } from 'react';
import { connect } from 'react-redux';
import AccelerometerChart from './AccelerometerChart';

const mapStateToProps = state => ({
    data: state.data.accelerometerData,
});

const AccelerometerMetrics = ({ data }) => (
    <div className="temperature-chart-container">
        <div className="magnetometer-chart">
            <AccelerometerChart data={data} />
        </div>
    </div>
);

export default connect(mapStateToProps)(AccelerometerMetrics);
