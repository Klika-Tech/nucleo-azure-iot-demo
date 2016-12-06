import React, { Component, PropTypes } from 'react';
import WeatherParams from './Params';
import WeatherChart from './Chart';

const WeatherChartContainer = ({
    type, chartType, displayedCitiesData, units, sensorData, citiesData,
    onChangeType, onToggleVisibility, onChangeUnits,
}) => (
    <div className="nucleo-chart-container">
        <WeatherParams
            chartType={chartType}
            citiesData={citiesData}
            displayedCitiesData={displayedCitiesData}
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
                citiesData={displayedCitiesData}
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
    sensorData: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.instanceOf(Date),
    })),
    citiesData: PropTypes.arrayOf(PropTypes.shape({
        cityId: PropTypes.number,
        cityName: PropTypes.string,
    })),
    displayedCitiesData: PropTypes.arrayOf(PropTypes.shape({
        cityId: PropTypes.number,
        cityName: PropTypes.string,
    })),
    onChangeType: PropTypes.func,
    onToggleVisibility: PropTypes.func,
    onChangeUnits: PropTypes.func,
};

export default WeatherChartContainer;
