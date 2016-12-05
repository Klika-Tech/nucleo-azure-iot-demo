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

export const toggleVisibility = value => (dispatch, getState) => {
    const oldShowFor = getState().pressure.showFor;
    let showFor;
    if (_.includes(oldShowFor, value)) {
        showFor = _.without(oldShowFor, value);
    } else {
        showFor = _.union(oldShowFor, [value]);
    }
    dispatch({
        type: PRESSURE_TOGGLE_VISIBILITY,
        payload: {
            showFor,
        },
    });
};

export const pressureFetch = (fullData) => {
    const pdi = prepareSensorDataItem(HYPER_PASCALS);
    const data = fullData.sensorData.map(pdi);
    const weatherData = fullData.weatherData.map(d => ({
        cityId: d.cityId,
        cityName: d.cityName,
        data: d.pressureData.map(pdi),
    }));
    return {
        type: PRESSURE_UPDATE,
        payload: {
            data,
            weatherData,
        },
    };
};

export const pressurePush = (chunks, state) => {
    const pdi = prepareSensorDataItem(HYPER_PASCALS);
    let data = state.data;
    data = data.concat(chunks.map(pdi));
    data = getActualData(data);
    const weatherData = getUpdatedWeatherDataStub(state.weatherData, data);
    return {
        type: PRESSURE_UPDATE,
        payload: {
            data,
            weatherData,
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
function getUpdatedWeatherDataStub(weatherData, sensorData) {
    weatherData.forEach((d) => {
        const last = _.last(d.data);
        last.date = _.last(sensorData).date;
        d.data.push(last);
        d.data = getActualData(d.data);
    });
    return weatherData;
}
