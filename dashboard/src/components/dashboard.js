
import React from 'react'
import { Link } from 'react-router'
import _ from 'lodash'
import { Grid, Row, Col, PanelContainer, Panel, PanelHeader, PanelBody } from '@sketchpixy/rubix'

import TemperatureChart from './temperature-chart-simple'
import HumidityChart from './humidity-chart-simple'
import PressureChart from './pressure-chart-simple'
import MagnetometerChart from './magnetometer-chart-simple'
import GyroscopeChart from './gyroscope-chart-simple'
import AccelerometerChart from './accelerometer-chart-simple'

import './dashboard.scss'


const Dashboard = ({ data }) => {

    // Showing last 5 minutes
    data = _.takeRight(data, 300)

    return (
        <Grid className="dashboard">
            <Row>
                <Col xs={12} sm={6} md={4}>
                    <PanelContainer>
                        <Panel>
                            <PanelHeader className="bg-green">
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="fg-white">
                                            <h4>Temperature</h4>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelHeader>
                            <PanelBody>
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="chart-panel-body">
                                            <Link to="/temperature">
                                                <TemperatureChart data={data} />
                                            </Link>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelBody>
                        </Panel>
                    </PanelContainer>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <PanelContainer>
                        <Panel>
                            <PanelHeader className="bg-green">
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="fg-white">
                                            <h4>Humidity</h4>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelHeader>
                            <PanelBody>
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="chart-panel-body">
                                            <Link to="/humidity">
                                                <HumidityChart data={data} />
                                            </Link>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelBody>
                        </Panel>
                    </PanelContainer>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <PanelContainer>
                        <Panel>
                            <PanelHeader className="bg-green">
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="fg-white">
                                            <h4>Barometer</h4>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelHeader>
                            <PanelBody>
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="chart-panel-body">
                                            <Link to="/barometer">
                                                <PressureChart data={data} />
                                            </Link>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelBody>
                        </Panel>
                    </PanelContainer>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <PanelContainer>
                        <Panel>
                            <PanelHeader className="bg-green">
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="fg-white">
                                            <h4>Magnetometer</h4>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelHeader>
                            <PanelBody>
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="chart-panel-body">
                                            <Link to="/magnetometer">
                                                <MagnetometerChart data={data} />
                                            </Link>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelBody>
                        </Panel>
                    </PanelContainer>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <PanelContainer>
                        <Panel>
                            <PanelHeader className="bg-green">
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="fg-white">
                                            <h4>Gyroscope</h4>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelHeader>
                            <PanelBody>
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="chart-panel-body">
                                            <Link to="/gyroscope">
                                                <GyroscopeChart data={data} />
                                            </Link>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelBody>
                        </Panel>
                    </PanelContainer>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <PanelContainer>
                        <Panel>
                            <PanelHeader className="bg-green">
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="fg-white">
                                            <h4>Accelerometer</h4>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelHeader>
                            <PanelBody>
                                <Grid>
                                    <Row>
                                        <Col xs={12} className="chart-panel-body">
                                            <Link to="/accelerometer">
                                                <AccelerometerChart data={data} />
                                            </Link>
                                        </Col>
                                    </Row>
                                </Grid>
                            </PanelBody>
                        </Panel>
                    </PanelContainer>
                </Col>
            </Row>
        </Grid>
    )
}


export default Dashboard