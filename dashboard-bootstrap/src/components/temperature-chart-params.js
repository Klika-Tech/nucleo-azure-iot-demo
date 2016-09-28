import React from 'react'

import { Form, FormGroup, ControlLabel, Radio, Checkbox } from '@sketchpixy/rubix'

module.exports = React.createClass({

	setChartType: function(event) {
		this.props.setChartParam('chartType', event.target.value)
	},

	setUnits: function(event) {
		this.props.setChartParam('units', event.target.value)
	},

	setShowWeatherFor: function(event) {

		var value = parseInt(event.target.value)

		var showWeatherFor

		if (_.includes(this.props.chartParams.showWeatherFor, value))
			showWeatherFor = _.without(this.props.chartParams.showWeatherFor, value)
		else
			showWeatherFor = _.union(this.props.chartParams.showWeatherFor, [value])

		this.props.setChartParam('showWeatherFor', showWeatherFor)
	},

	render: function() {

		var that = this

		var chartParams = this.props.chartParams

		return (
			<div className="temperature-chart-params">
				<Form>
                        <FormGroup>
                            <ControlLabel>Chart Type</ControlLabel>
                            <Radio checked={chartParams.chartType == 'area'} value="area" onChange={this.setChartType} inline>Area</Radio>
                            <Radio checked={chartParams.chartType == 'line'} value="line" onChange={this.setChartType} inline>Line</Radio>
                        </FormGroup>

                        <FormGroup>
                            <ControlLabel>Units</ControlLabel>
                            <Radio checked={chartParams.units == 'c'} value="c" onChange={this.setUnits} inline>°C</Radio>
                            <Radio checked={chartParams.units == 'f'} value="f" onChange={this.setUnits} inline>°F</Radio>
                        </FormGroup>

                        <FormGroup>
                            <ControlLabel>Weather Data</ControlLabel>
						{_(this.props.weatherData)
							.sortBy(function(d) { return d.cityName })
							.map(function(d) {
								return <Checkbox key={d.cityId} checked={_.includes(chartParams.showWeatherFor, d.cityId)} value={d.cityId} onChange={that.setShowWeatherFor} >{d.cityName}</Checkbox>
							}).value()}
                        </FormGroup>
				</Form>
			</div>
		)
	}
})
