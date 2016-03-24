var _ = require('lodash')

var React = require('react')

var Chart = require('chart.js')
Chart.defaults.global.responsive = true
Chart.defaults.global.animation = false

var LineChart = require('react-chartjs').Line


module.exports = React.createClass({

	transformData: function(dataItem) {
		return [
			dataItem.temperature,
			new Date(dataItem.timestamp * 1000).toLocaleTimeString()
		]
	},

	prepareData: function() {

		var metricData = _(this.props.data)
			.takeRight(60)
			.map(this.transformData)
			.unzip()
			.value()

		return {
			labels: metricData[1],
			datasets: [
				{
					label: "Temperature Data",
					fillColor: "rgba(151,187,205,0.2)",
					strokeColor: "rgba(151,187,205,1)",
					pointColor: "rgba(151,187,205,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(151,187,205,1)",
					data: metricData[0]
				}
			]
		}
	},

	render: function() {

		if (this.props.data === undefined) return <div />
		else {

			var opts = {
				pointHitDetectionRadius: 5,
				tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>C",
				scaleOverride: true,
				scaleSteps: 12,
				scaleStepWidth: 5,
				scaleStartValue: -20
			}

			return (
				<div>
					<h1>Temperature Sensor</h1>
					<LineChart data={this.prepareData()} redraw options={opts} />
				</div>
			)
		}
	}
})

