require('file?name=[name].[ext]!./index.html')

var _ = require('lodash')

var React = require('react')
var ReactDOM = require('react-dom')

var Chart = require('chart.js')
Chart.defaults.global.responsive = true
Chart.defaults.global.animation = false

var LineChart = require('react-chartjs').Line


var TemperatureGraph = React.createClass({

	render: function() {

		if (this.props.data === undefined) return <div />
		else return <LineChart data={this.props.data} />
	}
})


var App = React.createClass({

	getInitialState: function() { return {} },

	fetchData: function() {

		var self = this

		fetch('https://v7yns2sew7.execute-api.us-east-1.amazonaws.com/prod/getNucleoMetrics?metric=temperature&since=1457347223')
		  .then(function(response) {
		  	return response.json()
		  })
		  .then(function(metricData) {

		  	metricData = _(metricData)
				.map(function(item) {
						return [
							parseInt(item.value),
							new Date(parseInt(item.timestamp * 1000)).toLocaleTimeString()
						]
					})
				.unzip()
				.value()

			var data = {
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

			self.setState({temperatureData: data})
		  })

	},

	componentDidMount: function() {

		this.fetchData()
		setInterval(this.fetchData, 10000)
	},

	render: function() {
		return <TemperatureGraph data={this.state.temperatureData} />
	}
})


ReactDOM.render(
	<App />,
	document.getElementById('content')
)
