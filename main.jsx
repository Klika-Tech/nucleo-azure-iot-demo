require('file?name=[name].[ext]!./index.html')

var _ = require('lodash')

var React = require('react')
var ReactDOM = require('react-dom')

require('aws-sdk/dist/aws-sdk')
var AWS = window.AWS

var Chart = require('chart.js')
Chart.defaults.global.responsive = true
Chart.defaults.global.animation = false
Chart.defaults.global.tooltipTemplate= "<%if (label){%><%=label%>: <%}%><%= value %>C"

var LineChart = require('react-chartjs').Line

var SigV4Utils = require('./sigv4utils')

var mqtt = require('mqtt')

var TemperatureGraph = React.createClass({

	render: function() {

		if (this.props.data === undefined) return <div />
		else return (
			<div>
				<h1>Temperature Sensor</h1>
				<LineChart data={this.props.data} redraw />
			</div>
		)
	}
})


var App = React.createClass({

	getInitialState: function() { return {} },

	prepareData: function(dataItem) {
		return [
			parseInt(dataItem.temperature),
			new Date(parseInt(dataItem.timestamp * 1000)).toLocaleTimeString()
		]
	},

	fetchData: function() {

		var that = this

		var since = Math.round(Date.now() / 1000) - 300

		return fetch('https://v7yns2sew7.execute-api.us-east-1.amazonaws.com/prod/getNucleoMetrics?metric=temperature&since=' + since)
		  .then(function(response) {
		  	return response.json()
		  })
		  .then(function(metricData) {

		  	if (_.isEmpty(metricData)) return

		  	metricData = _(metricData)
				.takeRight(60)
				.map(that.prepareData)
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

			that.setState({temperatureData: data})
		  })

	},

	initMqttClient: function() {

		var that = this

		AWS.config.region = 'us-east-1'
		var awsCreds = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: 'us-east-1:094c9684-1d40-449f-8305-b4ad3d6e5ff4',
		})

		awsCreds.get(function(err) {

			if(err) {
				console.log(err)
				return
			}
			var url = SigV4Utils.getSignedUrl(
				'wss',
				'data.iot.us-east-1.amazonaws.com',
				'/mqtt',
				'iotdevicegateway',
				'us-east-1',
				awsCreds.accessKeyId,
				awsCreds.secretAccessKey,
				awsCreds.sessionToken)

			var client = mqtt.connect(url, {reconnectPeriod: 2147483647})

			client.on('connect', function() {
				client.subscribe('Nucleo/data')
			})

			client.on('message', function(topic, msg) {
				
				var data = that.prepareData(JSON.parse(msg.toString()))

				var tempData = that.state.temperatureData

				tempData.labels.push(data[1])
				tempData.labels = _.takeRight(tempData.labels, 60)
				tempData.datasets[0].data.push(data[0])
				tempData.datasets[0].data = _.takeRight(tempData.datasets[0].data, 60)

				that.setState({temperatureData: tempData})
			})

			client.on('close', function() {

				console.log('MQTT client disconnected')

				client.end()
				
				setTimeout(function() {
					console.log('Reconnecting')
					that.initMqttClient()
				}, 1000)
			})

		})
	},

	componentDidMount: function() {

		var that = this

		this.fetchData()
			.then(function() { that.initMqttClient() })
	},

	render: function() {
		return <TemperatureGraph data={this.state.temperatureData} />
	}
})


ReactDOM.render(
	<App />,
	document.getElementById('content')
)
