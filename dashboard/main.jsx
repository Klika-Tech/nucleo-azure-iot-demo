require('file?name=[name].[ext]!./index.html')

var _ = require('lodash')

var React = require('react')
var ReactDOM = require('react-dom')

var AWS = require('exports?AWS!aws-sdk/dist/aws-sdk')

var Chart = require('chart.js')
Chart.defaults.global.responsive = true
Chart.defaults.global.animation = false

var LineChart = require('react-chartjs').Line

var SigV4Utils = require('./sigv4utils')

var mqtt = require('mqtt')

var TemperatureGraph = React.createClass({

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


var App = React.createClass({

	getInitialState: function() { return {} },

	prepareData: function(dataItem) {
		return {
			temperature: parseInt(dataItem.temperature),
			timestamp: parseInt(dataItem.timestamp)
		}
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

			that.setState({temperatureData: _.map(metricData, that.prepareData)})
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

			// There is no way to disable auto-reconnect in mqtt so setting the
			// reconnect period to max value
			var client = mqtt.connect(url, {reconnectPeriod: 2147483647})

			client.on('connect', function() {

				client.subscribe(['Nucleo/data', 'Nucleo/test'])

				// There is a limit on AWS side on websocket connection duration (5 minutes)
				// So we're closing the connection in advance
				setTimeout(function() {
					client.end()
				}, 270000)
			})

			client.on('message', function(topic, msg) {
				
				var msg = msg.toString()

				console.log('Message recieved.\nTopic: ' + topic + '\nPayload: ' + msg)

				if (topic == 'Nucleo/data') {

					var dataItem = that.prepareData(JSON.parse(msg.toString()))

					var newData = _(that.state.temperatureData)
						.filter(function(item) {
							return item.timestamp >= Math.round(Date.now() / 1000) - 86400
						})
						.push(dataItem)
						.value()

					that.setState({temperatureData: newData})
				}
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
