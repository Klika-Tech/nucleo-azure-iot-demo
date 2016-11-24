import React, { Component, PropTypes } from 'react';
import Dimensions from 'react-dimensions';
import * as d3 from 'd3';
import { scaleTime, scaleLinear } from 'd3-scale';
import './realtime-chart.scss';
import Axis from './Axis';
import Line from './Line';
import Focus from './Focus';


class AccelerometerChart extends Component {
    constructor(props) {
        super(props);

        this.x = scaleTime();
        this.y = scaleLinear();
        this.x2 = scaleTime();
        this.y2 = scaleLinear();

        this.state = {
            cursor: {},
        };

        console.log('Init!');

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.updateD3(props);
    }

    componentWillReceiveProps(newProps) {
        this.updateD3(newProps);
    }

    updateD3(props) {
        console.log('updateD3!');

        const { x, y, x2, y2 } = this;
        const { containerWidth, containerHeight, data } = props;
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
        // -------------- //
        this.margin = { top: 10, right: 10, bottom: 100, left: 0 };
        this.margin2 = { top: containerHeight - 70, right: 10, bottom: 20, left: 0 };
        this.width = containerWidth - this.margin.left - this.margin.right;
        this.height = containerHeight - this.margin.top - this.margin.bottom;
        this.height2 = containerHeight - this.margin2.top - this.margin2.bottom;
        // -------------- //
        y.domain([
            Math.floor((minY - 0.3) * 30) / 30,
            Math.ceil((maxY + 0.3) * 30) / 30,
        ]).range([this.height, 0]);
        x.domain(focusDomain).range([0, this.width]);
        x2.domain(contextDomain).range([0, this.width]);
        y2.domain(y.domain()).range([this.height2, 0]);
    }

    handleMouseMove(x, y) {
        this.setState({
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

    render() {
        const { containerWidth, containerHeight, data } = this.props;
        const { margin, margin2, x, y, x2, y2, height, height2, width } = this;
        return (
            <svg width={containerWidth} height={containerHeight}>
                <defs>
                    <clipPath id="clip">
                        <rect width={width} height={height} />
                    </clipPath>
                </defs>
                <Focus margin={margin} onMouseMove={this.handleMouseMove}>
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
                    <line
                        stroke="black" strokeWidth="1px"
                        y1="0" y2={height}
                        x1={this.state.cursorX} x2={this.state.cursorX}
                    />
                    <Axis type="x" scale={x} translate={[0, height]} />
                    <Axis type="y" scale={y} width={width} tickFormat={v => (`${y.tickFormat()(v)}g`)} />
                </Focus>
                <g className="context" transform={`translate(${margin2.left},${margin2.top})`}>
                    <g className="brush">
                        <Line
                            className="x"
                            data={data}
                            x={d => x2(d.date)}
                            y={d => y2(d.accelerometer.x)}
                        />
                        <Line
                            className="y"
                            data={data}
                            x={d => x2(d.date)}
                            y={d => y2(d.accelerometer.y)}
                        />
                        <Line
                            className="z"
                            data={data}
                            x={d => x2(d.date)}
                            y={d => y2(d.accelerometer.z)}
                        />
                    </g>
                    <Axis type="x" scale={this.x2} translate={[0, height2]} />
                </g>
            </svg>
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


export default Dimensions()(AccelerometerChart);
