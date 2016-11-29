import React from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
    Sidebar,
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
import config from '../../../config';
import * as FetchService from '../../../services/fetchService';
import * as AwsMqttFactory from '../../../services/awsMqttFactory';
import Loader from '../../common/Loader';
import { fetchData, pushData } from '../../../actions/data';
import Menu from './Menu';
import '../../../rubix/sass/main.scss';
import './style.scss';

const MainContainerWR = withRouter(MainContainer);

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loader: true,
            online: false,
        };
    }

    componentDidMount() {
        const self = this;
        const { dispatch } = this.props;

        FetchService.fetchAwsMetrics(config).then((data) => {
            dispatch(fetchData(data));
            self.setState({ loader: false });
            const clientPromise = AwsMqttFactory.getInstance(config);
            clientPromise.then((client) => {
                client.on('connect', () => {
                    self.setState({ online: true });
                });
                client.on('message', (topic, msg) => {
                    const message = msg.toString();
                    if (config.debug) console.info('Message recieved.\nTopic: %s\nPayload: %s', topic, message);
                    if (topic === config.mqttTopic) {
                        dispatch(pushData(JSON.parse(message)));
                    }
                });
                client.on('close', () => {
                    self.setState({ online: false });
                });
            });
        });
    }

    render() {
        if (this.state.loader) {
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
        const statusClassName = classNames('online-status', { online: this.state.online });

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
                                        <Menu />
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
                                                <div className={statusClassName}>
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
                    {wrapInPanel(React.cloneElement(this.props.children))}
                </div>

            </MainContainerWR>
        );
    }

}

export default connect()(Main);
