import _ from 'lodash';
import 'whatwg-fetch';
import config from '../config';

/**
 * Data service
 * */
let DATA_STORE = {
    sensorData: [],
    weatherData: [],
};

/**
 * @return {*}
 */
export function init() {
    return fetchData();
}

/**
 * @return {{sensorData: Array, weatherData: Array}}
 */
export function get() {
    return DATA_STORE;
}

/**
 * @param data
 */
export function pushSensorData(data) {
    const dataItem = prepareData(data);
    DATA_STORE.sensorData = _(DATA_STORE.sensorData)
        .filter(item => item.timestamp >= Math.round(Date.now() / 1000) - 86400, // Cache control
        )
        .push(dataItem)
        .value();
}

function fetchData() { // getting the data for the last 4h
    const since = Math.round(Date.now() / 1000) - 14400;

    return fetch(`${config.apiUrl}getNucleoMetrics?metric=temperature&since=${since}`)
        .then(response => response.json())
        .then((data) => {
            const metricData = data.sensorData;

            if (_.isEmpty(metricData)) return;

            _.forEach(data.weatherData, (d) => {
                d.tempData = _.map(d.tempData, prepareData);
                d.humidityData = _.map(d.humidityData, prepareData);
                d.pressureData = _.map(d.pressureData, prepareData);
            });

            DATA_STORE = data;
        });
}

function prepareData(dataItem) {
    const result = {
        timestamp: dataItem.timestamp === undefined
            ? Math.round(Date.now() / 1000)
            : +dataItem.timestamp,
        marker: dataItem.marker,
    };

    if (dataItem.temperature !== undefined) result.temperature = parseFloat(dataItem.temperature);
    if (dataItem.humidity !== undefined) result.humidity = parseFloat(dataItem.humidity);
    if (dataItem.pressure !== undefined) result.pressure = parseFloat(dataItem.pressure);
    if (dataItem.magnetometer !== undefined) result.magnetometer = dataItem.magnetometer;
    if (dataItem.accelerometer !== undefined) result.accelerometer = dataItem.accelerometer;
    if (dataItem.gyroscope !== undefined) result.gyroscope = dataItem.gyroscope;

    return result;
}
