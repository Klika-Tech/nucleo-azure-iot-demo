var React = require('react')

module.exports = React.createClass({

	setChartType: function(event) {
		this.props.setChartParam('chartType', event.target.value)
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
				<form>
					<fieldset>
						<legend>Chart Parameters</legend>

						Chart Type<br />
						<input type="radio" name="chart-type" id="chart-type-area" value="area" checked={chartParams.chartType == 'area' ? 'checked' : ''} onChange={this.setChartType} />
						<label htmlFor="chart-type-area">Area</label><br />
						<input type="radio" name="chart-type" id="chart-type-line" value="line" checked={chartParams.chartType == 'line' ? 'checked' : ''} onChange={this.setChartType} />
						<label htmlFor="chart-type-line">Line</label>
						<hr />

						Show weather data for:
						{_(this.props.weatherData)
							.sortBy(function(d) { return d.cityName })
							.map(function(d) {
								return <div key={d.cityId}>
									<input type="checkbox" id={'show-weather-for-' + d.cityId} value={d.cityId} onChange={that.setShowWeatherFor} checked={_.includes(chartParams.showWeatherFor, d.cityId) ? 'checked' : ''} />
									<label htmlFor={'show-weather-for-' + d.cityId}>{d.cityName}</label>
								</div>
							}).value()}
					</fieldset>
				</form>
			</div>
		)
	}
})
