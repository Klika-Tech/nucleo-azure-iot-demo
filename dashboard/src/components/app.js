import React from 'react';
import { render } from 'react-dom';
import { withRouter } from 'react-router';
import {
    Sidebar,
    SidebarNav,
    SidebarNavItem,
    SidebarBtn,
    Grid,
    Col,
    Row,
    MainContainer,
    PanelContainer,
    Panel,
    PanelBody,
    Navbar,
    NavbarHeader,
    NavbarBrand,
    Nav,
    NavItem,
    Icon,
    Tooltip,
    OverlayTrigger,
} from '@sketchpixy/rubix';
import classNames from 'classnames';
import * as dataService from '../services/iotData';
import awsMqtt from '../services/awsMqtt';
import Loader from './loader';
import '../main.scss';
import '../rubix/sass/main.scss';

const MainContainerWR = withRouter(MainContainer);

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        dataService.init()
            .then(() => {
                awsMqtt();
                // ----------------- // hide loader
                this.setState({ sensorData: [] });
            });
    }

    render() {
        if (this.state.sensorData === undefined) {
            return (
              <div className="app">
                <div className="loader"><Loader /></div>
              </div>
            );
        }

        const onlineTooltip = (
          <Tooltip id="online-tooltip">
                The board is {this.state.online ? 'online' : 'offline'}
          </Tooltip>
        );

        const wrapInPanel = (children) => {
            if (this.props.location.pathname === '/dashboard') {
                return children;
            }
            return (
              <Grid>
                <Row>
                  <Col xs={12}>
                    <PanelContainer className="full-screen">
                      <Panel>
                        <PanelBody>{children}</PanelBody>
                      </Panel>
                    </PanelContainer>
                  </Col>
                </Row>
              </Grid>
            );
        };

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
                            <SidebarNavItem
                              name="Accelerometer" href="/accelerometer"
                              glyph="icon-fontello-chart-line"
                            />
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
                  <Navbar fixedTop fluid id="rubix-nav-header">
                    <Grid fluid>
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
                            <NavbarBrand>Nucleo Board</NavbarBrand>
                          </NavbarHeader>
                        </Col>
                        <Col xs={3} sm={8}>
                          <Nav pullRight>
                            <div
                              className={classNames('online-status', { online: this.state.online })}
                            >
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
              {wrapInPanel(React.cloneElement(
                        this.props.children,
                  {
                      data: this.state.sensorData,
                      weatherData: this.state.weatherData,
                  }))}
            </div>

          </MainContainerWR>
        );
    }

}
