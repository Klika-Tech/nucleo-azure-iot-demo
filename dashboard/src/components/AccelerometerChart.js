import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { scaleTime, scaleLinear } from 'd3-scale';
import './realtime-chart.scss';
import Chart from './Chart';
import Axis from './Axis';
import Line from './Line';
import Focus from './Focus';
import BrushX from './BrushX';
import Cursor from './Cursor';
import CursorMarker from './CursorMarker';
import CursorTooltip from './CursorTooltip';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
});

class AccelerometerChart extends Component {
    constructor(props) {
        super(props);
        this.x = scaleTime();
        this.y = scaleLinear();
        this.x2 = scaleTime();
        this.y2 = scaleLinear();
        this.margin = { top: 10, right: 10, bottom: 100, left: 0 };
        this.margin2 = { right: 10, bottom: 20, left: 0 };
        this.state = { cursorVisible: false };
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateDimension = this.updateDimension.bind(this);
        this.updateD3(props);
    }

    componentWillReceiveProps(newProps) {
        this.updateD3(newProps, this.props);
    }

    updateD3(newProps, oldProps = {}) {
        if (oldProps.data !== newProps.data) {
            this.updateData(newProps);
        }
        if ((oldProps.containerWidth !== newProps.containerWidth)
            || (oldProps.containerHeight !== newProps.containerHeight)) {
            this.updateDimension(newProps);
        }
    }

    updateData(props) {
        const { x, y, x2, y2 } = this;
        const { data } = props;
        const minY = d3.min(data.map(
            d => Math.min(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z)));
        const maxY = d3.max(data.map(
            d => Math.max(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z)));
        const contextDomain = d3.extent(data.map(d => d.date));
        const bisector = d3.bisector(d => d.date).right;
        let focusDomain = [contextDomain[1] - 300000, contextDomain[1]];
        const focusData = data.slice(
            Math.max(0, bisector(data, focusDomain[0]) - 1),
            Math.min(data.length, bisector(data, focusDomain[1]) + 1),
        );
        focusDomain = d3.extent(focusData.map(d => d.date));
        y.domain([
            Math.floor((minY - 0.3) * 30) / 30,
            Math.ceil((maxY + 0.3) * 30) / 30,
        ]);
        x.domain(focusDomain);
        x2.domain(contextDomain);
        y2.domain(y.domain());
    }

    updateDimension(props) {
        const { x, y, x2, y2 } = this;
        const { containerWidth, containerHeight } = props;
        this.margin2.top = containerHeight - 70;
        this.width = containerWidth - this.margin.left - this.margin.right;
        this.height = containerHeight - this.margin.top - this.margin.bottom;
        this.height2 = containerHeight - this.margin2.top - this.margin2.bottom;
        y.range([this.height, 0]);
        x.range([0, this.width]);
        x2.range([0, this.width]);
        y2.range([this.height2, 0]);
    }

    handleMouseMove(x, y) {
        const { data } = this.props;
        const datePos = this.x.invert(x);
        const i = d3.bisector(d => d.date).right(data, datePos);
        const cursorData = data[i];
        this.setState({
            cursorData,
            cursorVisible: true,
            cursorX: x,
            cursorY: y,
        });
    }

    handleMouseOut() {
        this.setState({
            cursorVisible: false,
        });
    }

    handleBrushEnd(selection) {
        console.log(selection);
    }

    render() {
        const { containerWidth, containerHeight, data } = this.props;
        const { margin, margin2, x, y, x2, y2, height, height2, width, state } = this;
        return (
            <div className="temperature-chart-container">
                <div className="magnetometer-chart">
                    <svg width={containerWidth} height={containerHeight}>
                        <defs>
                            <clipPath id="clip">
                                <rect width={width} height={height} />
                            </clipPath>
                        </defs>
                        <Focus
                            margin={margin}
                            height={height}
                            width={width}
                            onMouseMove={this.handleMouseMove}
                            onMouseOut={this.handleMouseOut}
                        >
                            <g className="zoom">
                                <Line
                                    className="x"
                                    data={data}
                                    x={d => x(d.date)}
                                    y={d => y(d.accelerometer.x)}
                                />
                                <Line
                                    className="y"
                                    data={data}
                                    x={d => x(d.date)}
                                    y={d => y(d.accelerometer.y)}
                                />
                                <Line
                                    className="z"
                                    data={data}
                                    x={d => x(d.date)}
                                    y={d => y(d.accelerometer.z)}
                                />
                            </g>
                            <Axis
                                type="x"
                                scale={x}
                                data={data}
                                translate={[0, height]}
                            />
                            <Axis
                                type="y"
                                scale={y}
                                data={data}
                                tickSize={width}
                                tickFormat={v => (`${y.tickFormat()(v)}g`)}
                            />
                        </Focus>
                        <g className="context" transform={`translate(${margin2.left},${margin2.top})`}>
                            <BrushX width={width} height={height2} onBrushEnd={this.handleBrushEnd}>
                                <Line
                                    className="x"
                                    data={data}
                                    x={d => x2(d.date)}
                                    y={d => y2(d.accelerometer.x)}
                                    skipRenderCount={10}
                                />
                                <Line
                                    className="y"
                                    data={data}
                                    x={d => x2(d.date)}
                                    y={d => y2(d.accelerometer.y)}
                                    skipRenderCount={10}
                                />
                                <Line
                                    className="z"
                                    data={data}
                                    x={d => x2(d.date)}
                                    y={d => y2(d.accelerometer.z)}
                                    skipRenderCount={10}
                                />
                            </BrushX>
                            <Axis
                                type="x"
                                data={data}
                                scale={this.x2}
                                translate={[0, height2]}
                                skipRenderCount={10}
                            />
                        </g>
                    </svg>
                    <Cursor
                        y={margin.top}
                        x={state.cursorX}
                        height={height}
                        visible={state.cursorVisible}
                    >
                        <CursorMarker
                            data={state.cursorData}
                            y={d => y(d.accelerometer.x)}
                        >
                            <CursorTooltip cursorX={state.cursorX} containerWidth={width}>
                                {getTooltipText(state.cursorData, 'x')}
                            </CursorTooltip>
                        </CursorMarker>

                        <CursorMarker
                            data={state.cursorData}
                            y={d => y(d.accelerometer.y)}
                        >
                            <CursorTooltip cursorX={state.cursorX} containerWidth={width}>
                                {getTooltipText(state.cursorData, 'y')}
                            </CursorTooltip>
                        </CursorMarker>

                        <CursorMarker
                            data={state.cursorData}
                            y={d => y(d.accelerometer.z)}
                        >
                            <CursorTooltip cursorX={state.cursorX} containerWidth={width}>
                                {getTooltipText(state.cursorData, 'z')}
                            </CursorTooltip>
                        </CursorMarker>

                    </Cursor>
                </div>
            </div>
        );
    }
}

AccelerometerChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        accelerometer: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
            z: PropTypes.number,
        }),
        date: PropTypes.instanceOf(Date),
    })),
};

export default connect(mapStateToProps)(Chart(AccelerometerChart));

const timeFormat = d3.timeFormat('%X');

function getTooltipText(data, axis) {
    if (data) {
        const axisLabel = axis.toUpperCase();
        const value = Math.round(data.accelerometer[axis] * 100) / 100;
        const date = timeFormat(data.date);
        return `${axisLabel}: ${value}g @ ${date}`;
    }
    return '';
}
