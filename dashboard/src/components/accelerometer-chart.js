import React from 'react'
import * as d3 from 'd3'
import {scaleTime, scaleLinear} from 'd3-scale';
import {axisBottom, axisRight} from 'd3-axis';
import _ from 'lodash'
import * as dataService from '../services/iotData'
import {lineOptimized} from '../d3utils'
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

        console.time('initChart');

        let margin, margin2, width, height, height2;

        const x = scaleTime(),
            y = scaleLinear(),
            x2 = scaleTime(),
            y2 = scaleLinear();

        const xAxis = axisBottom(),
            xAxis2 = axisBottom(),
            yAxis = axisRight();

        let xDomain = [],
            contextData = [],
            focusData = [];

        const focusPathGenerator = _.mapValues({ x: null , y: null , z: null }, (v, axis) =>
            //d3.line()
            lineOptimized()
                .y((d) => y(d.accelerometer[axis]))
                .x((d) => x(d.date))
        );

        const contextPathGenerator = _.mapValues({ x: null , y: null , z: null }, (v, axis) =>
            //d3.line()
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

        const zoomContainer = focus.append('g')
            .attr('class', 'zoom');

        const focusPath = {
            x: zoomContainer.append('path').attr('class', 'line x') // line x
            , y: zoomContainer.append('path').attr('class', 'line y')
            , z: zoomContainer.append('path').attr('class', 'line z')
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

        const brushContainer = context.append('g')
            .attr('class', 'brush');

        const contextPath = {
            x: brushContainer.append('path').attr('class', 'line x'),
            y: brushContainer.append('path').attr('class', 'line y'),
            z: brushContainer.append('path').attr('class', 'line z')
        };

        const contextXAxis = context.append('g')
            .attr('class', 'x axis');

        const brushed = () => {
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            let brushDomain = d3.event.selection
                .map(x.invert);

            console.log(brushDomain);
            this.updateData(brushDomain);
            //this.updateBrush();
            this.updateFocusChart();
        };

        const zoomed = () => {
            //if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
            console.log('log zooming!');
        };

        const mousemove = () => {
            const xPos = d3.mouse(el)[0] - margin.left;
            const datePos = x.invert(xPos);
            const i = d3.bisector((d) => d.date).right(contextData, datePos);
            const d = contextData[i];

            const rectBBox = focusBg.node().getBBox();

            // ---------------------------- //
            const focusOverlayOffset = 2;
            focusCursor.style('visibility', 'visible');
            focusCursor.style('left', xPos + margin.left + focusOverlayOffset + 'px');
            // ---------------------------- //
            const pointSize = 12;
            _.forEach(focusCursorPoints, (point, axis) => {
                point.style('visibility', 'visible')
                    //.style('left', x(d.date) - pointSize/2 + 'px')
                    .style('left',  xPos + margin.left - pointSize/2 + focusOverlayOffset + 'px')
                    .style('top', y(d.accelerometer[axis]) + margin.top - pointSize/2 + focusOverlayOffset + 'px');
            });
            // ---------------------------- //
            _.forEach(markerTooltip, (tooltip, axis) => {
                tooltip.text(`${axis.toUpperCase()}: ${Math.round(d.accelerometer[axis] * 100) / 100}g @ ${d3.timeFormat('%X')(d.date)}`)
                    .style('top', y(d.accelerometer[axis]) - 25 + 'px')
                    .style('visibility', 'visible')
                    .attr('class', 'cursor-tooltip' + (d.marker ? ' marker' : ''))
            });
            if (xPos - rectBBox.width < -200) {
                _.forEach(markerTooltip, tooltip => {
                    tooltip.style('left', xPos + margin.left + 5 + 'px')
                        .style('right', 'initial')
                })
            } else {
                _.forEach(markerTooltip, tooltip => {
                    tooltip.style('right', rectBBox.width - xPos + margin.right + 5 + 'px')
                        .style('left', 'initial')
                })
            }
            // ---------------------------- //
        };

        const mouseout = () => {
            // ---------------------------- //
            focusCursor
                .style('visibility', 'hidden');
            // ---------------------------- //
            _.forEach(markerTooltip, tooltip => {
                tooltip.style('visibility', 'hidden');
            });

            _.forEach(focusCursorPoints, (point, axis) => {
                point.style('visibility', 'hidden');
            });
        };

        // Focus cursor (SVG)
        focus
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);


        this.setDimensions = () => {

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
                .tickFormat((v) => (y.tickFormat()(v) + 'g'));

            brush.extent([[0, 0], [width, height2]])
                .on("brush end", brushed); // TODO: Refactoring

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

        this.updateChart = () => {

            this.updateData();

            // this.updateBrush();

            this.updateFocusChart();

            this.updateContextChart();

            brushContainer.call(brush);

        };

        this.updateData = (brushDomain) => {
            contextData = this.prepareData(dataService.get().sensorData);
            xDomain = d3.extent(contextData.map((d) => d.date));
            let bisector = d3.bisector(function (d) { return d.date }).right;
            let [min, max] = x.domain();
            focusData = contextData.slice(
                Math.max(0, bisector(contextData, min) - 1),
                Math.min(contextData.length, bisector(contextData, max) + 1)
            )
        };

        this.updateBrush = () => {
            console.log(d3.event);
            const isBrushEmpty = (d3.event) ? !d3.event.selection : true;
            if (isBrushEmpty) {
                x.domain([xDomain[1] - 300000, xDomain[1]])
            } else x.domain(brush.extent());
            if (!isBrushEmpty)
                brush.extent(x.domain())(context.select('.brush'))
        };

        this.updateFocusChart = () => {
            y.domain([
                Math.floor((d3.min(contextData.map(d => Math.min(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z))) - .3) * 30) / 30,
                Math.ceil((d3.max(contextData.map(d => Math.max(d.accelerometer.x, d.accelerometer.y, d.accelerometer.z))) + .3) * 30) / 30
            ]);
            x.domain([xDomain[1] - 300000, xDomain[1]]);
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

        this.updateContextChart = () => {
            x2.domain(xDomain);
            y2.domain(y.domain());
            _.forEach(contextPath, (path, axis) => {
                path.datum(contextData)
                    .attr('d', contextPathGenerator[axis])
            });
            contextXAxis.call(xAxis2);
        };

        // ============================== //
        // ============================== //

        this.setDimensions();
        this.updateChart();

        console.timeEnd('initChart');

        // ============================== //
        // ============================== //

        // Safe animation loop
        d3.interval(() => {
            this.updateData();
            this.updateFocusChart();
        }, 1000);
        d3.interval(() => {
            this.updateContextChart();
        }, 10500);

        // ============================== //
        // ============================== //

        d3.select(window).on('resize.accelerometer', () => {
            this.setDimensions();
            this.updateChart();
        })

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