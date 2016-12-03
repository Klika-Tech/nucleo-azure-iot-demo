import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';
import { scaleTime, scaleLinear } from 'd3-scale';
import '../../common/style.scss';
import Chart from '../../common/Chart';
import Axis from '../../common/Axis';
import Line from '../../common/Line';
import Focus from '../../common/Focus';
import BrushX from '../../common/BrushX';
import DimensionsCursor from './DimensionsCursor';

class DimensionsChart extends Component {
    constructor(props) {
        super(props);
        this.x = scaleTime();
        this.y = scaleLinear();
        this.x2 = scaleTime();
        this.y2 = scaleLinear();
        this.margin = { top: 0, right: 40, bottom: 100, left: 0 };
        this.margin2 = { right: 10, bottom: 20, left: 0 };
        this.state = {
            cursorData: null,
            cursorX: 0,
            cursorVisible: false,
        };
        this.calculateCursorState = this.calculateCursorState.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleBrushMount = this.handleBrushMount.bind(this);
        this.handleBrushEnd = this.handleBrushEnd.bind(this);
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

    updateData() {
        const { x, y, x2, y2 } = this;
        const { yDomain, focusDomain, contextDomain } = this.props;
        y.domain(yDomain);
        x.domain(focusDomain);
        x2.domain(contextDomain);
        y2.domain(yDomain);
        // start brush selection
        this.defaultSelection = focusDomain.map(d => x2(d));
        // use component state for cursor position for better performance
        const cursorX = this.state.cursorX;
        if (cursorX) {
            const cursorVisible = this.state.cursorVisible;
            const cs = this.calculateCursorState(cursorX);
            this.state = {
                ...cs,
                cursorX,
                cursorVisible,
            };
        }
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

    calculateCursorState(xPos) {
        const { x } = this;
        const { data } = this.props;
        const datePos = x.invert(xPos);
        const index = d3.bisector(d => d.date).right(data, datePos);
        return {
            cursorData: data[index],
            cursorX: xPos,
        };
    }

    handleMouseMove(xPos) {
        const { calculateCursorState } = this;
        const cs = calculateCursorState(xPos);
        cs.cursorVisible = true;
        this.setState(cs);
    }

    handleMouseOut() {
        this.setState({
            cursorVisible: false,
        });
    }

    handleBrushEnd(selection) {
        const { onBrushEnd } = this.props;
        onBrushEnd.call({}, this.x2, selection);
    }

    handleBrushMount({ moveBrush }) {
        this.moveBrush = moveBrush;
    }

    render() {
        const { containerWidth, containerHeight, data,
            brushSelection, type, units,
        } = this.props;
        const { margin, margin2, x, y, x2, y2, height, height2, width, moveBrush, defaultSelection, state } = this;
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
                            wheel={({ moveBrush, defaultSelection, selection: brushSelection })}
                        >
                            <g className="zoom">
                                <Line
                                    className="x"
                                    data={data}
                                    x={d => x(d.date)}
                                    y={d => y(d[type].x)}
                                />
                                <Line
                                    className="y"
                                    data={data}
                                    x={d => x(d.date)}
                                    y={d => y(d[type].y)}
                                />
                                <Line
                                    className="z"
                                    data={data}
                                    x={d => x(d.date)}
                                    y={d => y(d[type].z)}
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
                                tickFormat={v => (`${y.tickFormat()(v)}${units}`)}
                            />
                        </Focus>
                        <g className="context" transform={`translate(${margin2.left},${margin2.top})`}>
                            <BrushX
                                width={width}
                                height={height2}
                                onBrushEnd={this.handleBrushEnd}
                                onBrushMount={this.handleBrushMount}
                            >
                                <Line
                                    className="x"
                                    data={data}
                                    x={d => x2(d.date)}
                                    y={d => y2(d[type].x)}
                                    skipRenderCount={10}
                                />
                                <Line
                                    className="y"
                                    data={data}
                                    x={d => x2(d.date)}
                                    y={d => y2(d[type].y)}
                                    skipRenderCount={10}
                                />
                                <Line
                                    className="z"
                                    data={data}
                                    x={d => x2(d.date)}
                                    y={d => y2(d[type].z)}
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
                    <DimensionsCursor
                        type={type}
                        units={units}
                        data={state.cursorData}
                        cursorX={state.cursorX}
                        cursorVisible={state.cursorVisible}
                        margin={margin}
                        height={height}
                        width={width}
                        y={y}
                    />
                </div>
            </div>
        );
    }
}

DimensionsChart.propTypes = {
    type: PropTypes.string,
    units: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.instanceOf(Date),
    })),
    yDomain: PropTypes.arrayOf(PropTypes.number),
    focusDomain: PropTypes.array,
    contextDomain: PropTypes.array,
    brushSelection: PropTypes.arrayOf(PropTypes.number),
    onBrushEnd: PropTypes.func,
};

export default Chart(DimensionsChart);
