import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HYPER_PASCALS } from '../../scaleUnits';
import WeatherChart from '../common/WeatherChart';
import { changeChartType, toggleVisibility } from '../../actions/pressure';

const mapStateToProps = state => ({
    chartType: state.pressure.chartType,
    showFor: state.pressure.showFor,
    sensorData: state.pressure.data,
    weatherData: state.pressure.weatherData,
});

const mapDispatchToProps = dispatch => ({
    handleChangeType(type) {
        dispatch(changeChartType(type));
    },
    handleToggleVisibility(value) {
        dispatch(toggleVisibility(value));
    },
});

const Barometer = ({ sensorData, chartType, showFor, weatherData, handleChangeType, handleToggleVisibility }) => (
    <WeatherChart
        type="pressure"
        units={HYPER_PASCALS}
        chartType={chartType}
        showFor={showFor}
        sensorData={sensorData}
        weatherData={weatherData}
        onChangeType={handleChangeType}
        onToggleVisibility={handleToggleVisibility}
    />
);

export default connect(mapStateToProps, mapDispatchToProps)(Barometer);
