import React from 'react';
import * as d3 from 'd3';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisRight } from 'd3-axis';
import _ from 'lodash';
import TemperatureChartParams from './temperature-chart-params';
import './realtime-chart.scss';
import DataStore from '../services/dataStore';
import lineOptimized from '../services/lineOptimized';

function initChart(el, store) {
    // ==== Init require stuff ====== //
    // ============================== //

    const margin = { top: 10, right: 10, bottom: 100, left: 0 };
    const margin2 = { right: 10, bottom: 20, left: 0 };
    const zoomVelocity = 3;

    let width;
    let height;
    let height2;

    const x = scaleTime();
    const y = scaleLinear();
    const x2 = scaleTime();
    const y2 = scaleLinear();

    const xAxis = axisBottom();
    const xAxis2 = axisBottom();
    const yAxis = axisRight()
        .tickFormat(v => (`${y.tickFormat()(v)} ${unit.toUpperCase()}`));

    let contextData = [];
    let contextDomain = null;
    let focusData = [];
    let focusDomain = null;
    let focusCursorXPos = null;

    const unit = 'c';

    const focusPathGenerator = lineOptimized()
        .y(d => y(d.temperature))
        .x(d => x(d.date));

    const contextPathGenerator = lineOptimized()
        .y(d => y2(d.temperature))
        .x(d => x2(d.date));

    const brush = d3.brushX();

    const svg = d3.select(el).append('svg');

    const rect = svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect');

    const focus = svg.append('g')
        .attr('class', 'focus');

    const focusPathsContainer = focus.append('g')
        .attr('class', 'zoom');

    const focusPath = focusPathsContainer
        .append('path')
        .attr('class', 'line');

    const focusCursor = d3.select(el).append('div')
        .attr('class', 'cursor-focus');

    const markerTooltip = d3.select(el).append('div').attr('class', 'tooltip');

    const focusCursorPoint = d3.select(el)
        .append('div')
        .attr('class', 'cursor-point');

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

    const contextPathsContainer = context
        .append('g')
        .attr('class', 'brush');

    const contextPath = contextPathsContainer
        .append('path')
        .attr('class', 'line');

    const contextXAxis = context.append('g')
        .attr('class', 'x axis');

    // ======= First render ========= //
    // ============================== //

    setDimensions();
    updateChart();

    // === Init actions handler  ==== //
    // ============================== //

    focus
        .on('mousemove', mousemove)
        .on('mouseout', mouseout)
        .on('wheel', zoomed);
    brush.on('brush end', brushed);
    contextPathsContainer.call(brush);
    d3.select(window).on('resize', resized);

    // === Start safe render loop === //
    // ============================== //

    d3.interval(() => {
        updateData();
        updateFocusChart();
        updateFocusCursorPosition();
    }, 1000);
    d3.interval(() => {
        updateContextChart();
    }, 10500);

    // ========== Utils ============= //
    // ============================== //

    function mousemove() {
        focusCursorXPos = d3.mouse(el)[0] - margin.left;
        // ---------------------------- //
        focusCursor
            .style('visibility', 'visible');
        // ---------------------------- //
        markerTooltip.style('visibility', 'visible');
        // ---------------------------- //
        focusCursorPoint.style('visibility', 'visible');
        // ---------------------------- //
        updateFocusCursorPosition();
    }

    function mouseout() {
        // ---------------------------- //
        focusCursor
            .style('visibility', 'hidden');
        // ---------------------------- //
        markerTooltip.style('visibility', 'hidden');
        // ---------------------------- //
        focusCursorPoint.style('visibility', 'hidden');
    }

    function brushed() {
        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.
        const brushDomain = d3.event.selection
            .map(x2.invert);

        updateData(brushDomain);
        updateFocusChart();
    }

    function zoomed() {
        const selection = d3.brushSelection(contextPathsContainer.node()); // is selection was
        if (!selection) return;

        const deltaY = d3.event.deltaY === undefined ? d3.event.wheelDeltaY : d3.event.deltaY;
        const isZoomIn = deltaY < 0;

        const zoomedSelection = (isZoomIn) // selection
            ? [selection[0] - zoomVelocity, selection[1] + zoomVelocity]
            : [selection[0] + zoomVelocity, selection[1] - zoomVelocity];

        let validatedSelection = [ // extra zoom out
            ((zoomedSelection[0] < 0) ? 0 : zoomedSelection[0]),
            ((zoomedSelection[1] > width) ? width : zoomedSelection[1]),
        ];

        if (validatedSelection[0] >= validatedSelection[1]) { // extra zoom in
            validatedSelection = [validatedSelection[0], validatedSelection[0]];
        }

        brush.move(contextPathsContainer, validatedSelection);
    }

    function resized() {
        setDimensions();
        updateChart();
    }

    function setDimensions() {
        const container = el.getBoundingClientRect();

        margin2.top = container.height - 70; // TODO: refactoring
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
            .tickSize(width);

        brush.extent([[0, 0], [width, height2]]);

        svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        rect
            .attr('width', width)
            .attr('height', height);

        focusCursor
            .style('top', `${margin.top}px`)
            .style('height', `${height}px`);

        focus.attr('transform', `translate(${margin.left},${margin.top})`);
        focusBg.attr('width', width)
            .attr('height', height);
        context.attr('transform', `translate(${margin2.left},${margin2.top})`);
        focusXAxis.attr('transform', `translate(0,${height})`);
        contextXAxis.attr('transform', `translate(0,${height2})`);
    }

    function updateChart() {
        updateData();
        updateFocusChart();
        updateContextChart();
    }

    function prepareData(data) {
        return _(data)
            .map(item => ({
                temperature:
                        unit === 'f'
                            ? item.temperature * 9 / 5 + 32
                            : item.temperature,
                date: new Date(item.timestamp * 1000),
                marker: item.marker,
            }))
            .value();
    }

    function updateData(brushDomain = null) {
        contextData = prepareData(store.get().sensorData);
        contextDomain = d3.extent(contextData.map(d => d.date));
        const bisector = d3.bisector(d => d.date).right;

        let fd = focusDomain; // TODO: simplify
        fd = (!fd) ? [contextDomain[1] - 300000, contextDomain[1]] : fd;
        fd = (brushDomain) ? brushDomain : fd;

        const [min, max] = fd;
        focusData = contextData.slice(
            Math.max(0, bisector(contextData, min) - 1),
            Math.min(contextData.length, bisector(contextData, max) + 1),
        );
        focusDomain = d3.extent(focusData.map(d => d.date));
    }

    function updateFocusChart() {
        const minimal = d3.min(contextData, d => (d.temperature));
        const maximal = d3.max(contextData, d => (d.temperature));

        y.domain([minimal, maximal]);
        x.domain(focusDomain);
        focusPath.datum(focusData)
            .attr('d', focusPathGenerator);
        focusXAxis.call(xAxis);
        focusYAxis
            .call(yAxis)
            .selectAll('text')
            .attr('x', 4)
            .attr('dy', -4);
    }

    function updateContextChart() {
        x2.domain(contextDomain);
        y2.domain(y.domain());
        contextPath.datum(contextData)
            .attr('d', contextPathGenerator);
        contextXAxis.call(xAxis2);
    }

    function updateFocusCursorPosition() {
        const datePos = x.invert(focusCursorXPos);
        const i = d3.bisector(d => d.date).right(contextData, datePos);
        const d = contextData[i];
        if (d) {
            const rectBBox = focusBg.node().getBBox();
            // ---------------------------- //
            const focusOverlayOffset = 2;
            focusCursor.style('left', `${focusCursorXPos + margin.left + focusOverlayOffset}px`);
            // ---------------------------- //
            const pointSize = 12;
            focusCursorPoint
                .style('left', `${focusCursorXPos + margin.left - pointSize / 2 + focusOverlayOffset}px`)
                .style('top', `${y(d.temperature) + margin.top - pointSize / 2 + focusOverlayOffset}px`);
            // ---------------------------- //
            const value = Math.round(d.temperature * 100) / 100;
            const date = d3.timeFormat('%X')(d.date);
            markerTooltip.text(`${value}°${unit.toUpperCase()} @ ${date}`)
                .style('top', `${y(d.temperature) - 25}px`)
                .attr('class', `cursor-tooltip${d.marker ? ' marker' : ''}`);
            if (focusCursorXPos - rectBBox.width < -200) {
                markerTooltip.style('left', `${focusCursorXPos + margin.left + 5}px`)
                    .style('right', null);
            } else {
                markerTooltip.style('right', `${rectBBox.width - focusCursorXPos + margin.right + 5}px`)
                    .style('left', null);
            }
        }
    }
}

export default class TemperatureChart extends React.Component {
    constructor(props) {
        super(props);
        this.setEl = this.setEl.bind(this);
        this.setChartParam = this.setChartParam.bind(this);
        this.state = {
            chartParams: {
                chartType: 'area',
                units: 'c',
                showWeatherFor: [],
            },
        };
    }

    componentDidMount() {
        const { el } = this;
        const store = this.props.store;
        initChart(el, store);
    }

    setEl(el) {
        this.el = el;
    }

    setChartParam(paramName, value) {
        this.state.chartParams[paramName] = value;
        this.setState({
            chartParams: this.state.chartParams,
        });
    }

    render() {
        const weatherData = this.props.store.get().weatherData;
        return (
            <div className="temperature-chart-container">
                <TemperatureChartParams
                    setChartParam={this.setChartParam}
                    chartParams={this.state.chartParams}
                    weatherData={weatherData}
                />
                <div className="temperature-chart" ref={this.setEl} />
            </div>
        );
    }
}

TemperatureChart.propTypes = {
    store: React.PropTypes.instanceOf(DataStore),
};
