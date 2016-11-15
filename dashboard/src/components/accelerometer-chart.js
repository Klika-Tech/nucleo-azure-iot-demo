import React from 'react'
import * as d3 from 'd3'
import {scaleTime, scaleLinear} from 'd3-scale';
import {axisBottom, axisRight} from 'd3-axis';
import $ from 'jquery'
import _ from 'lodash'
import * as dataService from '../services/iotData'
import {debounce} from '../d3utils'
import './temperature-chart.scss'

const AccelerometerChart = React.createClass({

    prepareData: function (data) {

        return _(data)
            .map(function (item) {

                return {
                    accelerometer: {
                        x: item.accelerometer[0],
                        y: item.accelerometer[1],
                        z: item.accelerometer[2]
                    },
                    date: new Date(item.timestamp * 1000),
                    marker: item.marker
                }
            })
            .value()
    },

    initChart: function (el) {

        if (!el) return;

        console.time('initChart');

        let margin, margin2, width, height, height2;

        const x = scaleTime(),
            y = scaleLinear(),
            x2 = scaleTime(),
            y2 = scaleLinear();

        const xAxis = axisBottom(),
            xAxis2 = axisBottom(),
            yAxis = axisRight();


        const focusPathGenerator = _.mapValues({ x: null /*, y: null , z: null*/ }, (v, axis) =>
            d3.area()
                .y0(height)
                .y(function (d) { return y(d.accelerometer[axis]) })
                .x(function (d) { return x(d.date) }));

        const contextPathGenerator = _.mapValues({ x: null /*, y: null , z: null*/ }, (v, axis) =>
            d3.area()
                .y0(height2)
                .y(function (d) { return y2(d.accelerometer[axis]) })
                .x(function (d) { return x2(d.date) }));


        const svg = d3.select(el).append('svg');

        const rect = svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect');

        const focus = svg.append('g')
            .attr('class', 'focus');

        const focusPath = {
            x: focus.append('path').attr('class', 'line x') // line x
            // , y: focus.append('path').attr('class', 'line y')
            // , z: focus.append('path').attr('class', 'line z')
        };

        const focusCursor = focus.append('line')
            .attr('class', 'focus-cursor')
            .attr('y1', 0);

        const focusCursorPoints = {
            x: focus.append('circle').attr('class', 'cursor-point').attr('r', 5)
            // , y: focus.append('circle').attr('class', 'cursor-point').attr('r', 5)
            // , z: focus.append('circle').attr('class', 'cursor-point').attr('r', 5)
        };

        const focusBg = focus.append('rect')
            .attr('class', 'focus-bg')
            .attr('x', 0)
            .attr('y', 0);

        const cursor = focus.append('g')
            .attr('class', 'focus-cursor');

        const focusXAxis = focus.append('g')
            .attr('class', 'x axis');

        const focusYAxis = focus.append('g')
            .attr('class', 'y axis');

        const context = svg.append('g')
            .attr('class', 'context');

        const contextPath = {
            x: context.append('path').attr('class', 'line x'),
            y: context.append('path').attr('class', 'line y'),
            z: context.append('path').attr('class', 'line z')
        };

        const contextXAxis = context.append('g')
            .attr('class', 'x axis');

        const mousemove = () => {
            const xPos = d3.mouse(el)[0] - margin.left;
            focusCursor
                .attr('x1', xPos)
                .attr('x2', xPos)
                .style('visibility', 'visible');

            let datePos = x.invert(xPos);

            let i = d3.bisector(function(d) { return d.date }).right(this.data, datePos);

            let d = this.data[i];

            _.forEach(focusCursorPoints, (cpoint, axis) => {
                cpoint.attr('cx', xPos)
                    .attr('cy', y(d.accelerometer[axis]))
                    .style('visibility', 'visible')
            });

            // console.log(d);
        };

        const mouseout = () => {
            focusCursor
                .style('visibility', 'hidden');

            _.forEach(focusCursorPoints, (cpoint, axis) => {
                cpoint.style('visibility', 'hidden')
            });
        };

        // Focus cursor (SVG)
        focus
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

            // .on('mousemove', debounce(mousemove, 50))
            // .on('mouseout', debounce(mouseout, 50));


        this.setDimensions = function () {

            console.time('setDimensions');

            let container = el.getBoundingClientRect();

            margin = { top: 10, right: 10, bottom: 100, left: 0 };
            margin2 = { top: container.height - 70, right: 10, bottom: 20, left: 0 };
            width = container.width - margin.left - margin.right;
            height = container.height - margin.top - margin.bottom;
            height2 = container.height - margin2.top - margin2.bottom;

            x.range([0, width]);
            x2.range([0, width]);
            y.range([height, 0]);
            y2.range([height2, 0]);

            xAxis.scale(x);
            xAxis2.scale(x2);

            yAxis.scale(y)
                .tickSize(width)
                .tickFormat(function (v) {
                    return y.tickFormat()(v) + 'g'
                });

            svg
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

            rect
                .attr('width', width)
                .attr('height', height);

            focusCursor.attr('y2', height);

            focus.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            focusBg.attr('width', width)
                .attr('height', height);
            context.attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');
            focusXAxis.attr('transform', 'translate(0,' + height + ')');
            contextXAxis.attr('transform', 'translate(0,' + height2 + ')');

            console.timeEnd('setDimensions');

        };

        this.updateChart = () => {

            console.time('updateChart');

            let data = this.prepareData(dataService.get().sensorData);
            this.data = data;

            let xDomain = d3.extent(data.map(function (d) { return d.date }));

            y.domain([
                Math.floor((d3.min(data.map(d => Math.min(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z))) - .3) * 30) / 30,
                Math.ceil((d3.max(data.map(d => Math.max(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z))) + .3) * 30) / 30
            ]);
            x.domain([xDomain[1] - 300000, xDomain[1]]);

            // -------------------------------- //
            console.time('renderFocus');
            _.forEach(focusPath, (path, axis) => {
                path.datum(data)
                    .attr('d', focusPathGenerator[axis])
            });
            console.timeEnd('renderFocus');
            // -------------------------------- //

            x2.domain(xDomain);
            y2.domain(y.domain());

            // -------------------------------- //

            console.time('renderContext');
            _.forEach(contextPath, (path, axis) => {

                console.time('genContextPath');
                if (contextPathGenerator[axis])
                    contextPathGenerator[axis](data);
                console.timeEnd('genContextPath');

                path.datum(data)
                    .attr('d', contextPathGenerator[axis])
            });
            console.timeEnd('renderContext');

            // -------------------------------- //

            focusXAxis.call(xAxis);

            focusYAxis
                .call(yAxis)
                .selectAll('text')
                .attr('x', 4)
                .attr('dy', -4);

            contextXAxis.call(xAxis2);

            console.timeEnd('updateChart');

        };

        this.setDimensions();
        this.updateChart();

        console.timeEnd('initChart');

    },

    componentDidUpdate: function () {
        console.log('------------------');
        this.updateChart();
    },

    render: function () {
        return (
            <div className="temperature-chart-container">
                <div className="magnetometer-chart" ref={this.initChart}/>
            </div>
        );
    }
});

export default AccelerometerChart