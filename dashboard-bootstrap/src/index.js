import 'file?name=[name].[ext]!./index.html'

import _ from 'lodash'
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRedirect, hashHistory, withRouter } from 'react-router'
import AWS from 'exports?AWS!aws-sdk/dist/aws-sdk'
import mqtt from 'mqtt'
import classNames from 'classnames'

import SigV4Utils from './sigv4utils'

import TemperatureChart from './components/temperature-chart'
import HumidityChart from './components/humidity-chart'
import PressureChart from './components/pressure-chart'
import MagnetometerChart from './components/magnetometer-chart'
import GyroscopeChart from './components/gyroscope-chart'
import AccelerometerChart from './components/accelerometer-chart'

import { Sidebar, SidebarNav, SidebarNavItem, SidebarBtn, Grid, Col, Row, MainContainer, PanelContainer, Panel,
    PanelBody, Navbar, NavbarHeader, NavbarBrand, Nav, NavItem, Icon, Tooltip, OverlayTrigger } from '@sketchpixy/rubix'
const MainContainerWR = withRouter(MainContainer)

import './main.scss'
import './rubix/sass/main.scss'

import config from './config'


var Loader = React.createClass({

    render: function () {

        return (
            <svg>
                <use xlinkHref={require('./assets/oval.svg')}/>
            </svg>
        )
    }
})

var App = React.createClass({

    getInitialState: function () { return {} },

    prepareData: function (dataItem) {
        const result = {
            timestamp: dataItem.timestamp === undefined
                ? Math.round(Date.now() / 1000)
                : parseInt(dataItem.timestamp),
            marker: dataItem.marker
        }

        if (dataItem.temperature !== undefined) result.temperature = parseFloat(dataItem.temperature)
        if (dataItem.humidity !== undefined) result.humidity = parseFloat(dataItem.humidity)
        if (dataItem.pressure !== undefined) result.pressure = parseFloat(dataItem.pressure)
        if (dataItem.magnetometer !== undefined) result.magnetometer = dataItem.magnetometer
        if (dataItem.accelerometer !== undefined) result.accelerometer = dataItem.accelerometer
        if (dataItem.gyroscope !== undefined) result.gyroscope = dataItem.gyroscope

        return result
    },

    fetchData: function () {

        var that = this

        // getting the data for the last 24h
        var since = Math.round(Date.now() / 1000) - 14400

        return fetch(config.apiUrl + 'getNucleoMetrics?metric=temperature&since=' + since)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {

                var metricData = data.sensorData

                if (_.isEmpty(metricData)) return

                _.forEach(data.weatherData, function (d) {
                    d.tempData = _.map(d.tempData, that.prepareData)
                    d.humidityData = _.map(d.humidityData, that.prepareData)
                    d.pressureData = _.map(d.pressureData, that.prepareData)
                })

                that.setState({
                    sensorData: _.map(metricData, that.prepareData),
                    weatherData: data.weatherData
                })

                that.resetStatusMonitor()
            })

    },

    initMqttClient: function () {

        var that = this

        AWS.config.region = config.awsRegion
        var awsCreds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: config.cognitoIdentityPool,
        })

        awsCreds.get(function (err) {

            if (err) {
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
            var client = mqtt.connect(url, { reconnectPeriod: 2147483647 })

            client.on('connect', function () {

                client.subscribe(config.mqttTopic)

                // There is a limit on AWS side on websocket connection duration (5 minutes)
                // So we're closing the connection in advance
                setTimeout(function () {
                    client.end()
                }, 270000) // 4.5 minutes
            })

            client.on('message', function (topic, msg) {

                var msg = msg.toString()

                if (config.debug)
                    console.info('Message recieved.\nTopic: %s\nPayload: %s', topic, msg)

                if (topic == config.mqttTopic) {

                    var dataItem = that.prepareData(JSON.parse(msg.toString()))

                    var newData = _(that.state.sensorData)
                        .filter(function (item) {
                            return item.timestamp >= Math.round(Date.now() / 1000) - 86400
                        })
                        .push(dataItem)
                        .value()

                    that.setState({ sensorData: newData, online: true })
                    that.resetStatusMonitor()
                }
            })

            client.on('close', function () {

                console.log('MQTT client disconnected')

                client.end()

                setTimeout(function () {
                    console.log('Reconnecting')
                    that.initMqttClient()
                }, 1000)
            })

        })
    },

    componentDidMount: function () {

        this.fetchData()
            .then(() => { this.initMqttClient() })
    },

    resetStatusMonitor: function () {

        var that = this

        if (this.statusMonitor) clearTimeout(this.statusMonitor)

        this.statusMonitor = setTimeout(function () { that.setState({ online: false }) }, 15000)
    },

    render: function () {

        if (this.state.sensorData === undefined) return (
            <div className="app">
                <div className="loader"><Loader /></div>
            </div>
        )

        const onlineTooltip = (
            <Tooltip id="online-tooltip">
                The board is {this.state.online ? 'online' : 'offline'}
            </Tooltip>
        )

        return (
            <MainContainerWR>

                <div id="sidebar">
                    <div id="sidebar-container">
                        <Sidebar sidebar={0}>
                            <Grid>
                                <Row>
                                    <Col xs={12}>
                                        <div className="sidebar-nav-container">
                                            <SidebarNav>
                                                <SidebarNavItem name="Temperature" href="/temperature"
                                                                glyph="icon-fontello-temperatire"/>
                                                <SidebarNavItem name="Humidity" href="/humidity"
                                                                glyph="icon-fontello-water"/>
                                                <SidebarNavItem name="Barometer" href="/barometer"
                                                                glyph="icon-fontello-gauge"/>
                                                <SidebarNavItem name="Magnetometer" href="/magnetometer"
                                                                glyph="icon-fontello-magnet"/>
                                                <SidebarNavItem name="Gyroscope" href="/gyroscope"
                                                                glyph="icon-fontello-direction"/>
                                                <SidebarNavItem name="Accelerometer" href="/accelerometer"
                                                                glyph="icon-fontello-chart-line"/>
                                            </SidebarNav>
                                        </div>
                                    </Col>
                                </Row>
                            </Grid>
                        </Sidebar>
                    </div>
                </div>

                <Grid id="navbar">
                    <Row>
                        <Col xs={12}>
                            <Navbar fixedTop={true} fluid={true} id="rubix-nav-header">
                                <Grid fluid={true}>
                                    <Row>
                                        <Col xs={3} visible="xs">
                                            <SidebarBtn>
                                                <Nav className="pull-left visible-xs-inline-block">
                                                    <NavItem className="sidebar-btn" href="/">
                                                        <Icon bundle="fontello" glyph="th-list-5" />
                                                    </NavItem>
                                                </Nav>
                                            </SidebarBtn>
                                        </Col>
                                        <Col xs={6} sm={4}>
                                            <NavbarHeader>
                                                <NavbarBrand>
                                                    Nucleo Board
                                                </NavbarBrand>
                                            </NavbarHeader>
                                        </Col>
                                        <Col xs={3} sm={8}>
                                            <Nav pullRight>
                                                <div className={classNames('online-status', {online: this.state.online})}>
                                                    <OverlayTrigger placement="left" overlay={onlineTooltip}>
                                                        <Icon bundle="fontello" glyph="circle" />
                                                    </OverlayTrigger>
                                                </div>
                                            </Nav>
                                        </Col>
                                    </Row>
                                </Grid>
                            </Navbar>
                        </Col>
                    </Row>
                </Grid>

                <div id="body">
                    <Grid>
                        <Row>
                            <Col xs={12}>
                                <PanelContainer className="full-screen">
                                    <Panel>
                                        <PanelBody>
                                            {React.cloneElement(
                                                this.props.children,
                                                {
                                                    data: this.state.sensorData,
                                                    weatherData: this.state.weatherData,
                                                    boardOnline: this.state.online
                                                })}
                                        </PanelBody>
                                    </Panel>
                                </PanelContainer>
                            </Col>
                        </Row>
                    </Grid>
                </div>

            </MainContainerWR>
        )
    }
})


render((
        <Router history={hashHistory}>
            <Route path="/" component={App}>
                <IndexRedirect to="/temperature"/>
                <Route path="temperature" component={TemperatureChart}/>
                <Route path="humidity" component={HumidityChart}/>
                <Route path="barometer" component={PressureChart}/>
                <Route path="magnetometer" component={MagnetometerChart}/>
                <Route path="gyroscope" component={GyroscopeChart}/>
                <Route path="accelerometer" component={AccelerometerChart}/>
            </Route>
        </Router>
    ),
    document.getElementById('root')
)
