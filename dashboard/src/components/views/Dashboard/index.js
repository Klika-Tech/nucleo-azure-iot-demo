import React from 'react';
import { Link } from 'react-router';
import { Grid, Row, Col, PanelContainer, Panel, PanelHeader, PanelBody } from '@sketchpixy/rubix';
import './style.scss';
import AccelerometerWidget from './AccelerometerWidget';


const Dashboard = ({ data }) => (
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
                                        <Link to="/temperature">TODO</Link>
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
                                        <Link to="/humidity">TODO</Link>
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
                                        <Link to="/barometer">TODO</Link>
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
                                        <Link to="/magnetometer">TODO</Link>
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
                                        <Link to="/gyroscope">TODO</Link>
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
                                            <AccelerometerWidget />
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
    );


export default Dashboard;
