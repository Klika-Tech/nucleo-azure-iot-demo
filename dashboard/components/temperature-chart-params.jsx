var React = require('react')

module.exports = React.createClass({

	setChartType: function(event) {
		this.props.setChartParam('chartType', event.target.value)
	},

	render: function() {

		var chartParams = this.props.chartParams

		return (
			<div className="temperature-chart-params">
				<form>
					<fieldset>
						<legend>Chart Parameters</legend>

						Chart Type<br />
						<input type="radio" name="chart-type" id="chart-type-area" value="area" checked={chartParams.chartType == 'area' ? 'checked' : ''} onChange={this.setChartType} />
						<label for="chart-type-area">Area</label><br />
						<input type="radio" name="chart-type" id="chart-type-line" value="line" checked={chartParams.chartType == 'line' ? 'checked' : ''} onChange={this.setChartType} />
						<label for="chart-type-line">Line</label>
					</fieldset>
				</form>
			</div>
		)
	}
})
