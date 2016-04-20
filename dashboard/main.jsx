require('file?name=[name].[ext]!./index.html')

var _ = require('lodash')

var React = require('react')
var ReactDOM = require('react-dom')

var AWS = require('exports?AWS!aws-sdk/dist/aws-sdk')

var SigV4Utils = require('./sigv4utils')

var mqtt = require('mqtt')

var TemperatureChart = require('./components/temperature-chart')

require('./main.scss')

var config = require('./config')


var Loader = React.createClass({

	render: function() {

		return (
			<svg>
				<use xlinkHref={require('./oval.svg')} />
			</svg>
		)
	}
})

var App = React.createClass({

	getInitialState: function() { return {} },

	prepareData: function(dataItem) {
		return {
			temperature: parseFloat(dataItem.temperature),
			timestamp:
				dataItem.timestamp === undefined
					? Math.round(Date.now() / 1000)
					: parseInt(dataItem.timestamp),
			marker: dataItem.marker
		}
	},

	fetchData: function() {

		var that = this

		// getting the data for the last 24h
		var since = Math.round(Date.now() / 1000) - 86400

		return fetch(config.apiUrl + 'getNucleoMetrics?metric=temperature&since=' + since)
		  .then(function(response) {
		  	return response.json()
		  })
		  .then(function(data) {

		  	var metricData = data.sensorData

		  	if (_.isEmpty(metricData)) return

			_.forEach(data.weatherData, function(d) {
				d.tempData = _.map(d.tempData, that.prepareData)
			})

			that.setState({
				temperatureData: _.map(metricData, that.prepareData),
				weatherData: data.weatherData
			})

			that.resetStatusMonitor()
		  })

	},

	initMqttClient: function() {

		var that = this

		AWS.config.region = config.awsRegion
		var awsCreds = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: config.cognitoIdentityPool,
		})

		awsCreds.get(function(err) {

			if(err) {
				console.log(err)
				return
			}
			var url = SigV4Utils.getSignedUrl(
				'wss',
				config.iotEndpoint,
				'/mqtt',
				'iotdevicegateway',
				config.awsRegion,
				awsCreds.accessKeyId,
				awsCreds.secretAccessKey,
				awsCreds.sessionToken)

			// There is no way to disable auto-reconnect in mqtt so setting the
			// reconnect period to max value
			var client = mqtt.connect(url, {reconnectPeriod: 2147483647})

			client.on('connect', function() {

				client.subscribe(config.mqttTopic)

				// There is a limit on AWS side on websocket connection duration (5 minutes)
				// So we're closing the connection in advance
				setTimeout(function() {
					client.end()
				}, 270000) // 4.5 minutes
			})

			client.on('message', function(topic, msg) {
				
				var msg = msg.toString()

				if (config.debug)
					console.info('Message recieved.\nTopic: %s\nPayload: %s', topic, msg)

				if (topic == config.mqttTopic) {

					var dataItem = that.prepareData(JSON.parse(msg.toString()))

					var newData = _(that.state.temperatureData)
						.filter(function(item) {
							return item.timestamp >= Math.round(Date.now() / 1000) - 86400
						})
						.push(dataItem)
						.value()

					that.setState({temperatureData: newData, online: true})
					that.resetStatusMonitor()
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

	resetStatusMonitor: function() {

		var that = this

		if (this.statusMonitor) clearTimeout(this.statusMonitor)

		this.statusMonitor = setTimeout(function() { that.setState({online: false}) }, 15000)
	},

	render: function() {

		var that = this

		return (
			<div className="app">

				{function () {
					if (that.state.temperatureData === undefined)
						return <div className="loader"><Loader /></div>
				}()}

				<TemperatureChart data={this.state.temperatureData} weatherData={this.state.weatherData} boardOnline={this.state.online} />
			</div>
		)
	}
})


ReactDOM.render(
	<App />,
	document.getElementById('content')
)
