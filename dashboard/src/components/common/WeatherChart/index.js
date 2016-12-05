import React, { Component, PropTypes } from 'react';
import WeatherParams from './Params';
import WeatherChart from './Chart';

const WeatherChartContainer = ({
    type, chartType, showFor, units, sensorData, weatherData,
    onChangeType, onToggleVisibility, onChangeUnits,
}) => (
    <div className="nucleo-chart-container">
        <WeatherParams
            chartType={chartType}
            showFor={showFor}
            weatherData={weatherData}
            onChangeType={onChangeType}
            onToggleVisibility={onToggleVisibility}
            onChangeUnits={onChangeUnits}
        />
        <div className="weather-chart">
            <WeatherChart
                type={type}
                chartType={chartType}
                units={units}
                data={sensorData}
            />
        </div>
    </div>
);

WeatherChartContainer.propTypes = {
    type: PropTypes.string,
    units: PropTypes.shape({
        key: PropTypes.string,
        label: PropTypes.string,
    }),
    chartType: PropTypes.string,
    showFor: PropTypes.array,
    sensorData: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.instanceOf(Date),
    })),
    weatherData: PropTypes.arrayOf(PropTypes.shape({
        cityId: PropTypes.number,
        cityName: PropTypes.string,
    })),
    onChangeType: PropTypes.func,
    onToggleVisibility: PropTypes.func,
    onChangeUnits: PropTypes.func,
};

export default WeatherChartContainer;
