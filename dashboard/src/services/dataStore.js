import _ from 'lodash';

/**
 * Class data store
 * */
export default class DataStore {
    constructor() {
        this.store = {
            sensorData: [],
            weatherData: [],
        };
    }

    /**
     * Clean sensor data for period.
     * @param last - seconds from now
     */
    clearOldSensorData(last = 86400) {
        this.store.sensorData = _(this.store.sensorData)
            .filter(item => item.timestamp >= Math.round(Date.now() / 1000) - last)
            .value();
    }

    /**
     * Add new chunk of sensorData
     * @param data - init data
     */
    pushSensorData(data) {
        this.clearOldSensorData();
        const dataItem = DataStore.prepareData(data);
        this.store.sensorData.push(dataItem);
    }

    /**
     * @param data
     */
    init(data) {
        _.forEach(data.weatherData, (d) => {
            d.tempData = _.map(d.tempData, DataStore.prepareData);
            d.humidityData = _.map(d.humidityData, DataStore.prepareData);
            d.pressureData = _.map(d.pressureData, DataStore.prepareData);
        });
        this.store = data;
    }

    /**
     * Get store data.
     * @return {*|{sensorData: Array, weatherData: Array}}
     */
    get() {
        return this.store;
    }

    /**
     * Format item before store.
     * @param dataItem
     * @return {{timestamp: number, marker}}
     */
    static prepareData(dataItem) {
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
}
