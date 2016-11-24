import React, { Component } from 'react';
import _ from 'lodash';
import AccelerometerChart from './AccelerometerChart';

const AccelerometerMetrics = ({ store }) => (
    <div className="temperature-chart-container">
        <div className="magnetometer-chart">
            <AccelerometerChart data={prepareData(store.get().sensorData)} />
        </div>
    </div>
);

function prepareData(data) { // Сам себе злобный буратина!
    return _(data)
        .map(item => ({
            accelerometer: {
                x: item.accelerometer[0],
                y: item.accelerometer[1],
                z: item.accelerometer[2],
            },
            date: new Date(item.timestamp * 1000),
            marker: item.marker,
        }),
        )
        .value();
}

export default AccelerometerMetrics;
