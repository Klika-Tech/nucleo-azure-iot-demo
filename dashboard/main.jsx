require('file?name=[name].[ext]!./index.html')

var _ = require('lodash')

var React = require('react')
var ReactDOM = require('react-dom')

var AWS = require('exports?AWS!aws-sdk/dist/aws-sdk')

var SigV4Utils = require('./sigv4utils')

var mqtt = require('mqtt')

var TemperatureChart = require('./components/temperature-chart')

var TemperatureGraphLegacy = require('./components/temperature-graph-legacy')

require('./main.scss')


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

		return fetch('https://v7yns2sew7.execute-api.us-east-1.amazonaws.com/prod/getNucleoMetrics?metric=temperature&since=' + since)
		  .then(function(response) {
		  	return response.json()
		  })
		  .then(function(metricData) {

		  	if (_.isEmpty(metricData)) return

			that.setState({temperatureData: _.map(metricData, that.prepareData)})
			that.resetStatusMonitor()
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
				}, 270000) // 4.5 minutes
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
				{function() {
					if (that.state.online !== undefined) {

						var statusStr = that.state.online
								? <span className="online">online</span>
								: <span className="offline">offline</span>

						return <div className="status">Nucleo Board is {statusStr}</div>
					}
				}()}

				{function () {
					if (that.state.temperatureData === undefined)
						return <div className="loader"><Loader /></div>
				}()}

				<TemperatureChart data={this.state.temperatureData} />
				{/*<TemperatureGraphLegacy data={this.state.temperatureData} />*/}
			</div>
		)
	}
})


ReactDOM.render(
	<App />,
	document.getElementById('content')
)
