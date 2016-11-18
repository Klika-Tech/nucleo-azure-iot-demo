import React from 'react'
import * as d3 from 'd3'
import {scaleTime, scaleLinear} from 'd3-scale';
import {axisBottom, axisRight} from 'd3-axis';
import _ from 'lodash'
import * as dataService from '../services/iotData'
import {lineOptimized, debounce} from '../d3utils'
import './temperature-chart.scss'

const AccelerometerChart = React.createClass({

    prepareData: (data) => {

        return _(data)
            .map((item) => ({
                    accelerometer: {
                        x: item.accelerometer[0],
                        y: item.accelerometer[1],
                        z: item.accelerometer[2]
                    },
                    date: new Date(item.timestamp * 1000),
                    marker: item.marker
                })
            )
            .value()
    },

    initChart: function (el) {

        if (!el) return;

        const that = this;
        
        let margin, margin2, width, height, height2;

        const x = scaleTime(),
            y = scaleLinear(),
            x2 = scaleTime(),
            y2 = scaleLinear();

        const xAxis = axisBottom(),
            xAxis2 = axisBottom(),
            yAxis = axisRight();

        let contextData = [],
            contextDomain = null,
            focusData = [],
            focusDomain = null,
            focusCursorXPos = null;

        const focusPathGenerator = _.mapValues({ x: null , y: null , z: null }, (v, axis) =>
            lineOptimized()
                .y((d) => y(d.accelerometer[axis]))
                .x((d) => x(d.date))
        );

        const contextPathGenerator = _.mapValues({ x: null , y: null , z: null }, (v, axis) =>
            lineOptimized()
                .y((d) => y2(d.accelerometer[axis]))
                .x((d) => x2(d.date))
        );

        const brush = d3.brushX();

        const svg = d3.select(el).append('svg');

        const rect = svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect');

        const focus = svg.append('g')
            .attr('class', 'focus');

        const focusPathsContainer = focus.append('g')
            .attr('class', 'zoom');

        const focusPath = {
            x: focusPathsContainer.append('path').attr('class', 'line x') // line x
            , y: focusPathsContainer.append('path').attr('class', 'line y')
            , z: focusPathsContainer.append('path').attr('class', 'line z')
        };

        // -------------------- //
        const focusCursor = d3.select(el).append('div')
            .attr('class', 'cursor-focus');
        // -------------------- //
        const markerTooltip = _.mapValues({ x: null, y: null, z: null }, v =>
            d3.select(el).append('div').attr('class', 'tooltip')
        );
        // -------------------- //
        const focusCursorPoints = {
            x: d3.select(el).append('div').attr('class', 'cursor-point')
            , y: d3.select(el).append('div').attr('class', 'cursor-point')
            , z: d3.select(el).append('div').attr('class', 'cursor-point')
        };
        // -------------------- //

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

        const contextPathsContainer = context.append('g')
            .attr('class', 'brush');

        const contextPath = {
            x: contextPathsContainer.append('path').attr('class', 'line x'),
            y: contextPathsContainer.append('path').attr('class', 'line y'),
            z: contextPathsContainer.append('path').attr('class', 'line z')
        };

        const contextXAxis = context.append('g')
            .attr('class', 'x axis');

        const mousemove = () => {
            focusCursorXPos = d3.mouse(el)[0] - margin.left;
            // ---------------------------- //
            focusCursor
                .style('visibility', 'visible');
            // ---------------------------- //
            _.forEach(markerTooltip, tooltip => {
                tooltip.style('visibility', 'visible');
            });
            // ---------------------------- //
            _.forEach(focusCursorPoints, (point, axis) => {
                point.style('visibility', 'visible');
            });
            // ---------------------------- //
            that.updateFocusCursorPosition();
        };

        const mouseout = () => {
            // ---------------------------- //
            focusCursor
                .style('visibility', 'hidden');
            // ---------------------------- //
            _.forEach(markerTooltip, tooltip => {
                tooltip.style('visibility', 'hidden');
            });
            // ---------------------------- //
            _.forEach(focusCursorPoints, (point, axis) => {
                point.style('visibility', 'hidden');
            });
        };

        const brushed = () => {
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            let brushDomain = d3.event.selection
                .map(x2.invert);

            that.updateData(brushDomain);
            that.updateFocusChart();
        };

        const zoomed = () => {
            const selection = d3.brushSelection(contextPathsContainer.node()); // is selection was
            if(!selection) return;

            const velocity = 3; // zoom speed

            const deltaY = d3.event.deltaY === undefined ? d3.event.wheelDeltaY : d3.event.deltaY;
            const isZoomIn = deltaY < 0;

            const zoomedSelection = (isZoomIn) // selection
                ? [selection[0]-velocity, selection[1]+velocity]
                : [selection[0]+velocity, selection[1]-velocity];

            let validatedSelection = [ // extra zoom out
                ((zoomedSelection[0] < 0) ? 0 : zoomedSelection[0]),
                ((zoomedSelection[1]>width) ? width : zoomedSelection[1])
            ];

            if(validatedSelection[0] >= validatedSelection[1]) { // extra zoom in
                validatedSelection = [validatedSelection[0], validatedSelection[0]]
            }

            brush.move(contextPathsContainer, validatedSelection);
        };

        const resized = () => {
            that.setDimensions();
            that.updateChart();
        };

        that.setDimensions = () => {
            let container = el.getBoundingClientRect();

            margin = { top: 10, right: 10, bottom: 100, left: 0 };
            margin2 = { top: container.height - 70, right: 10, bottom: 20, left: 0 }; // TODO: refactoring
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
                .tickFormat((v) => (y.tickFormat()(v) + 'g'));

            brush.extent([[0, 0], [width, height2]]);

            svg
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

            rect
                .attr('width', width)
                .attr('height', height);

            focusCursor
                .style('top', margin.top+'px')
                .style('height', height+'px');

            focus.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            focusBg.attr('width', width)
                .attr('height', height);
            context.attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');
            focusXAxis.attr('transform', 'translate(0,' + height + ')');
            contextXAxis.attr('transform', 'translate(0,' + height2 + ')');

        };

        that.updateChart = () => {
            that.updateData();
            that.updateFocusChart();
            that.updateContextChart();
        };

        that.updateData = (brushDomain = null) => {
            contextData = that.prepareData(dataService.get().sensorData);
            contextDomain = d3.extent(contextData.map((d) => d.date));
            const bisector = d3.bisector(function (d) { return d.date }).right;

            let fd = focusDomain; // TODO: refactoring
            fd = (!fd) ? [contextDomain[1] - 300000, contextDomain[1]] : fd;
            fd = (brushDomain) ? brushDomain : fd;

            const [min, max] = fd;
            focusData = contextData.slice(
                Math.max(0, bisector(contextData, min) - 1),
                Math.min(contextData.length, bisector(contextData, max) + 1)
            );
            focusDomain = d3.extent(focusData.map((d) => d.date));
        };

        that.updateFocusChart = () => {
            y.domain([
                Math.floor((d3.min(contextData.map(d => Math.min(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z))) - .3) * 30) / 30,
                Math.ceil((d3.max(contextData.map(d => Math.max(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z))) + .3) * 30) / 30
            ]);
            x.domain(focusDomain);
            _.forEach(focusPath, (path, axis) => {
                path.datum(focusData)
                    .attr('d', focusPathGenerator[axis])
            });
            focusXAxis.call(xAxis);
            focusYAxis
                .call(yAxis)
                .selectAll('text')
                .attr('x', 4)
                .attr('dy', -4);
        };

        that.updateContextChart = () => {
            x2.domain(contextDomain);
            y2.domain(y.domain());
            _.forEach(contextPath, (path, axis) => {
                path.datum(contextData)
                    .attr('d', contextPathGenerator[axis])
            });
            contextXAxis.call(xAxis2);
        };

        that.updateFocusCursorPosition = () => {
            const datePos = x.invert(focusCursorXPos);
            const i = d3.bisector((d) => d.date).right(contextData, datePos);
            const d = contextData[i];

            const rectBBox = focusBg.node().getBBox();

            // ---------------------------- //
            const focusOverlayOffset = 2;
            focusCursor.style('left', focusCursorXPos + margin.left + focusOverlayOffset + 'px');
            // ---------------------------- //
            const pointSize = 12;
            _.forEach(focusCursorPoints, (point, axis) => {
                point
                    .style('left',  focusCursorXPos + margin.left - pointSize/2 + focusOverlayOffset + 'px')
                    .style('top', y(d.accelerometer[axis]) + margin.top - pointSize/2 + focusOverlayOffset + 'px');
            });
            // ---------------------------- //
            _.forEach(markerTooltip, (tooltip, axis) => {
                tooltip.text(`${axis.toUpperCase()}: ${Math.round(d.accelerometer[axis] * 100) / 100}g @ ${d3.timeFormat('%X')(d.date)}`)
                    .style('top', y(d.accelerometer[axis]) - 25 + 'px')
                    .attr('class', 'cursor-tooltip' + (d.marker ? ' marker' : ''))
            });
            if (focusCursorXPos - rectBBox.width < -200) {
                _.forEach(markerTooltip, tooltip => {
                    tooltip.style('left', focusCursorXPos + margin.left + 5 + 'px')
                        .style('right', 'initial')
                })
            } else {
                _.forEach(markerTooltip, tooltip => {
                    tooltip.style('right', rectBBox.width - focusCursorXPos + margin.right + 5 + 'px')
                        .style('left', 'initial')
                })
            }
            // ---------------------------- //
        };

        // ============================== //
        // ============================== //

        that.setDimensions();
        that.updateChart();

        // Init event handlers
        focus
            .on('mousemove', mousemove)
            .on('mouseout', mouseout)
            .on('wheel', zoomed);

        brush.on('brush end', brushed);
        contextPathsContainer.call(brush);
        d3.select(window).on('resize.accelerometer', resized);

        // ============================== //
        // ============================== //

        // Safe animation loop
        d3.interval(() => {
            that.updateData();
            that.updateFocusChart();
            that.updateFocusCursorPosition();
        }, 1000);
        d3.interval(() => {
            that.updateContextChart();
        }, 10500);

        // ============================== //
        // ============================== //
    },

    render: function() {
        return (
            <div className='temperature-chart-container'>
                <div className='magnetometer-chart' ref={this.initChart}/>
            </div>
        );
    }
});

export default AccelerometerChart