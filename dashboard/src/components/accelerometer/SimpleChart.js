import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { scaleTime, scaleLinear } from 'd3-scale';
import '../chart/style.scss';
import Chart from '../chart/Chart';
import Axis from '../chart/Axis';
import Line from '../chart/Line';

const mapStateToProps = state => ({
    data: state.accelerometer.data,
    yDomain: state.accelerometer.yDomain,
    focusDomain: state.accelerometer.focusDomain,
});

class SimpleAccelerometerChart extends Component {
    constructor(props) {
        super(props);
        this.x = scaleTime();
        this.y = scaleLinear();
        this.margin = { top: 0, right: 0, bottom: 60, left: 0 };
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
        const { x, y } = this;
        const { yDomain, focusDomain } = this.props;
        y.domain(yDomain);
        x.domain(focusDomain);
    }

    updateDimension(props) {
        const { x, y } = this;
        const { containerWidth, containerHeight } = props;
        this.width = containerWidth - this.margin.left - this.margin.right;
        this.height = containerHeight - this.margin.top - this.margin.bottom;
        y.range([this.height, 0]);
        x.range([0, this.width]);
    }

    render() {
        const { containerWidth, containerHeight, data } = this.props;
        const { margin, x, y, height, width } = this;
        return (
            <div className="temperature-chart-container">
                <div className="magnetometer-chart">
                    <svg width={containerWidth} height={containerHeight}>
                        <defs>
                            <clipPath id="clip">
                                <rect width={width} height={height} />
                            </clipPath>
                        </defs>
                        <g
                            className="focus"
                            transform={`translate(${margin.left},${margin.top})`}
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
                                ticks={4}
                                translate={[0, height]}
                            />
                            <Axis
                                type="y"
                                scale={y}
                                data={data}
                                tickSize={0}
                                ticks={4}
                                tickFormat={v => (`${y.tickFormat()(v)}g`)}
                            />
                        </g>
                    </svg>
                </div>
            </div>
        );
    }
}

SimpleAccelerometerChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        accelerometer: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
            z: PropTypes.number,
        }),
        date: PropTypes.instanceOf(Date),
    })),
};

export default connect(mapStateToProps)(Chart(SimpleAccelerometerChart));
