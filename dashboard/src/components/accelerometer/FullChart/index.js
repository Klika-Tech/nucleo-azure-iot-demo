import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { scaleTime, scaleLinear } from 'd3-scale';
import '../../chart/style.scss';
import Chart from '../../chart/Chart';
import Axis from '../../chart/Axis';
import Line from '../../chart/Line';
import Focus from '../../chart/Focus';
import BrushX from '../../chart/BrushX';
import AccelerometerCursor from './Cursor';
import { accelerometerFocusMove, accelerometerFocusOut, accelerometerBrushEnd } from '../../../actions/accelerometer';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
    yDomain: state.accelerometer.yDomain,
    focusDomain: state.accelerometer.focusDomain,
    contextDomain: state.accelerometer.contextDomain,
    brushSelection: state.accelerometer.brushSelection,
});

class AccelerometerChart extends Component {
    constructor(props) {
        super(props);
        this.x = scaleTime();
        this.y = scaleLinear();
        this.x2 = scaleTime();
        this.y2 = scaleLinear();
        this.margin = { top: 0, right: 40, bottom: 100, left: 0 };
        this.margin2 = { right: 10, bottom: 20, left: 0 };
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

    updateData(props) {
        const { x, y, x2, y2 } = this;
        const { yDomain, focusDomain, contextDomain } = this.props;
        y.domain(yDomain);
        x.domain(focusDomain);
        x2.domain(contextDomain);
        y2.domain(yDomain);
        // start brush selection
        this.defaultSelection = focusDomain.map(d => x2(d));
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

    handleMouseMove(xPos, y) {
        const { x } = this;
        const { dispatch, data } = this.props;
        dispatch(accelerometerFocusMove(data, x, xPos));
    }

    handleMouseOut() {
        const { dispatch } = this.props;
        dispatch(accelerometerFocusOut());
    }

    handleBrushEnd(selection) {
        const { dispatch } = this.props;
        console.log('selection:', selection);
        dispatch(accelerometerBrushEnd(this.x2, selection));
    }

    handleBrushMount({ moveBrush }) {
        this.moveBrush = moveBrush;
    }

    render() {
        const { containerWidth, containerHeight, data, brushSelection } = this.props;
        const { margin, margin2, x, y, x2, y2, height, height2, width, moveBrush, defaultSelection } = this;
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
                    <AccelerometerCursor margin={margin} height={height} width={width} y={y} />
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
