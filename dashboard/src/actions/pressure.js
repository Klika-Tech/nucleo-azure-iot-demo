import _ from 'lodash';
import { PRESSURE_UPDATE, PRESSURE_CHANGE_CHART_TYRE, PRESSURE_TOGGLE_VISIBILITY } from '../actionTypes';
import { getActualData } from './common/utils';
import { HYPER_PASCALS } from './../scaleUnits';

export const changeChartType = chartType => ({
    type: PRESSURE_CHANGE_CHART_TYRE,
    payload: {
        chartType,
    },
});

export const toggleVisibility = value => ({
    type: PRESSURE_TOGGLE_VISIBILITY,
    payload: {
        value,
    },
});

export const pressureFetch = (fullData) => {
    const pdi = prepareSensorDataItem(HYPER_PASCALS);
    const sensorData = fullData.sensorData.map(pdi);
    const citiesData = fullData.weatherData.map(d => ({
        cityId: d.cityId,
        cityName: d.cityName,
        data: d.pressureData.map(pdi),
    }));
    return {
        type: PRESSURE_UPDATE,
        payload: {
            sensorData,
            citiesData,
        },
    };
};

export const pressurePush = (chunks, state) => {
    const pdi = prepareSensorDataItem(HYPER_PASCALS);
    let sensorData = state.sensorData;
    sensorData = sensorData.concat(chunks.map(pdi));
    sensorData = getActualData(sensorData);
    const citiesData = getUpdatedCitiesDataStub(state.citiesData, sensorData);
    return {
        type: PRESSURE_UPDATE,
        payload: {
            sensorData,
            citiesData,
        },
    };
};

function prepareSensorDataItem(scaleUnit) {
    return item => ({
        pressure: {
            [scaleUnit.key]: item.pressure,
        },
        date: new Date(item.timestamp * 1000),
        marker: item.marker,
    });
}

/**
 * TODO: return data from server
 * */
function getUpdatedCitiesDataStub(citiesData, sensorData) {
    citiesData.forEach((d) => {
        const last = _.last(d.data);
        last.date = _.last(sensorData).date;
        d.data.push(last);
        d.data = getActualData(d.data);
    });
    return citiesData;
}
