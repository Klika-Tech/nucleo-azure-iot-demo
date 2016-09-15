import React from 'react'
import d3 from 'd3'
import _ from 'lodash'

import './temperature-chart.scss'

const GyroscopeChart = React.createClass({

    prepareData: function (data) {

        return _(data)
            .map(function (item) {

                return {
                    gyroscope: {
                        x: item.gyroscope[0],
                        y: item.gyroscope[1],
                        z: item.gyroscope[2]
                    },
                    date: new Date(item.timestamp * 1000),
                    marker: item.marker
                }
            })
            .value()
    },

    initChart: function (el) {

        if (!el) return

        var that = this

        var margin, margin2, width, height, height2

        var focusData

        var x = d3.time.scale(),
            x2 = d3.time.scale(),
            y = d3.scale.linear(),
            y2 = d3.scale.linear()

        var xAxis = d3.svg.axis().orient('bottom'),
            xAxis2 = d3.svg.axis().orient('bottom'),
            yAxis = d3.svg.axis().orient('right')

        var brush = d3.svg.brush()
            .clamp(true)
            .on('brushend', function () { that.updateChart() })

        const contextPathGenerator = _.mapValues({ x: null, y: null, z: null }, (v, axis) =>
            d3.svg.line()
                .y(function (d) { return y2(d.gyroscope[axis]) })
                .x(function (d) { return x2(d.date) }))

        var svg = d3.select(el).append('svg')

        var rect = svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect')

        var focus = svg.append('g')
            .attr('class', 'focus')

            .on('mousemove', function () {

                var xPos = d3.mouse(el)[0] - margin.left

                if (xPos < 0) return

                var datePos = x.invert(xPos)

                var i = d3.bisector(function (d) { return d.date }).right(focusData, datePos)

                if (i == focusData.length
                    || (i > 0 && datePos - focusData[i - 1].date < focusData[i].date - datePos))
                    i--

                var d = focusData[i]

                xPos = x(d.date)

                focusCursor
                    .attr('x1', xPos)
                    .attr('x2', xPos)
                    .style('visibility', 'visible')

                _.forEach(focusCursorPoint, (cpoint, axis) => {
                    cpoint.attr('cx', xPos)
                        .attr('cy', y(d.gyroscope[axis]))
                        .style('visibility', 'visible')
                })

                _.forEach(markerTooltip, (tooltip, axis) => {
                    tooltip.text(`${axis}: ${Math.round(d.gyroscope[axis] * 100) / 100}° @ ${d3.time.format('%X')(d.date)}`)
                        .style('top', y(d.gyroscope[axis]) - 25 + 'px')
                        .style('display', 'block')
                        .attr('class', 'tooltip' + (d.marker ? ' marker' : ''))
                })

                var rectBBox = focusBg.node().getBBox()

                if (xPos - rectBBox.width < -200)
                    _.forEach(markerTooltip, tooltip => {
                        tooltip.style('left', xPos + margin.left + 5 + 'px')
                            .style('right', 'initial')
                    })
                else
                    _.forEach(markerTooltip, tooltip => {
                        tooltip.style('right', rectBBox.width - xPos + margin.right + 5 + 'px')
                            .style('left', 'initial')
                    })

            })
            .on('mouseout', function () {

                _.forEach(markerTooltip, tooltip => {
                    tooltip.style('display', 'none')
                })

                focusCursor.style('visibility', 'hidden')

                _.forEach(focusCursorPoint, cpoint => {
                    cpoint.style('visibility', 'hidden')
                })
            })
            .on('wheel', function () {
                if (brush.empty())
                    brush.extent(x.domain())

                var brushFrom = brush.extent()[0].getTime()
                var brushTo = brush.extent()[1].getTime()
                var brushSize = brushTo - brushFrom

                var contextFrom = x2.domain()[0].getTime()
                var contextTo = x2.domain()[1].getTime()

                var multiplier = d3.event.deltaY === undefined ? d3.event.wheelDeltaY : d3.event.deltaY
                multiplier = multiplier > 0 ? 1.5 : .67

                brushSize = Math.min(brushSize * multiplier, contextTo - contextFrom)
                brushSize = Math.max(brushSize, 60000)

                var brushCenter = (brushTo - brushFrom) / 2 + brushFrom
                brushCenter = Math.min(brushCenter, contextTo - brushSize / 2)
                brushCenter = Math.max(contextFrom + brushSize / 2, brushCenter)

                brush.extent([new Date(brushCenter - brushSize / 2), new Date(brushCenter + brushSize / 2)])
                brush(context.select('.brush'))

                that.updateChart()
            })

        var focusBg = focus.append('rect')
            .attr('class', 'focus-bg')
            .attr('x', 0)
            .attr('y', 0)

        var context = svg.append('g')
            .attr('class', 'context')

        const focusPath = {
            x: focus.append('path').attr('class', 'line x'),
            y: focus.append('path').attr('class', 'line y'),
            z: focus.append('path').attr('class', 'line z')
        }

        var focusCursorPoint = {
            x: focus.append('circle').attr('class', 'cursor-point').attr('r', 5),
            y: focus.append('circle').attr('class', 'cursor-point').attr('r', 5),
            z: focus.append('circle').attr('class', 'cursor-point').attr('r', 5)
        }

        var focusMarkersG = focus.append('g')
            .attr('class', 'markers')

        var markerTooltip = _.mapValues({ x: null, y: null, z: null }, v =>
            d3.select(el).append('div').attr('class', 'tooltip'))

        var focusCursor = focus.append('line')
            .attr('class', 'focus-cursor')
            .attr('y1', 0)

        var focusXAxis = focus.append('g')
            .attr('class', 'x axis')

        var focusYAxis = focus.append('g')
            .attr('class', 'y axis')

        const contextPath = {
            x: context.append('path').attr('class', 'line x'),
            y: context.append('path').attr('class', 'line y'),
            z: context.append('path').attr('class', 'line z')
        }

        var contextMarkersG = context.append('g')
            .attr('class', 'context-markers')

        var contextXAxis = context.append('g')
            .attr('class', 'x axis')

        var contextG = context.append('g')
            .attr('class', 'x brush')


        var setDimensions

        (setDimensions = function () {

            var container = el.getBoundingClientRect()

            margin = { top: 10, right: 10, bottom: 100, left: 0 }
            margin2 = { top: container.height - 70, right: 10, bottom: 20, left: 0 }
            width = container.width - margin.left - margin.right
            height = container.height - margin.top - margin.bottom
            height2 = container.height - margin2.top - margin2.bottom

            x.range([0, width])
            x2.range([0, width])
            y.range([height, 0])
            y2.range([height2, 0])

            xAxis.scale(x)
            xAxis2.scale(x2)

            yAxis
                .scale(y)
                .tickSize(width)
                .tickFormat(function (v) {
                    return y.tickFormat()(v) + '°'
                })

            brush.x(x2)

            svg
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)

            rect
                .attr('width', width)
                .attr('height', height)

            focus.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            focusCursor.attr('y2', height)
            focusBg.attr('width', width)
                .attr('height', height)
            context.attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')')
            focusXAxis.attr('transform', 'translate(0,' + height + ')')
            contextXAxis.attr('transform', 'translate(0,' + height2 + ')')

            contextG.call(brush)
                .selectAll('rect')
                .attr('y', -6)
                .attr('height', height2 + 7)
        })()

        d3.select(window).on('resize', function () {
            setDimensions()
            that.updateChart()
        })


        this.updateChart = function () {

            var data = this.prepareData(this.props.data)

            var xDomain = d3.extent(data.map(function (d) { return d.date }))

            if (brush.empty()) {
                x.domain([xDomain[1] - 300000, xDomain[1]])
            } else x.domain(brush.extent())

            var bisector = d3.bisector(function (d) { return d.date }).right

            focusData = data.slice(
                Math.max(0, bisector(data, x.domain()[0]) - 1),
                Math.min(data.length, bisector(data, x.domain()[1]) + 1)
            )

            y.domain([
                Math.floor((d3.min(data.map(d => Math.min(d.gyroscope.x, d.gyroscope.y, d.gyroscope.z))) - .3) * 30) / 30,
                Math.ceil((d3.max(data.map(d => Math.max(d.gyroscope.x, d.gyroscope.y, d.gyroscope.z))) + .3) * 30) / 30
            ])

            x2.domain(xDomain)
            y2.domain(y.domain())

            const focusPathGenerator = _.mapValues({ x: null, y: null, z: null }, (v, axis) =>
                d3.svg.line()
                    .y(function (d) { return y(d.gyroscope[axis]) })
                    .interpolate('monotone')
                    .x(function (d) { return x(d.date) }))

            _.forEach(focusPath, (path, axis) => {
                path.datum(data)
                    .attr('d', focusPathGenerator[axis])
            })

            _.forEach(contextPath, (path, axis) => {
                path.datum(data)
                    .attr('d', contextPathGenerator[axis])
            })

            focusXAxis.call(xAxis)

            focusYAxis
                .call(yAxis)
                .selectAll('text')
                .attr('x', 4)
                .attr('dy', -4)

            contextXAxis.call(xAxis2)

            if (!brush.empty())
                brush.extent(x.domain())(context.select('.brush'))

            var markersData = _.filter(data, function (d) {
                return d.marker
            })

            var focusMarkersData = _.filter(markersData, function (d) {
                return d.date >= x.domain()[0] && d.date <= x.domain()[1]
            })

            const markers = focusMarkersG.selectAll('g.markers')
                .data(focusMarkersData)

            const markersG = markers.enter().append('g').attr('class', 'markers')

            markersG.append('circle').attr('class', 'marker x').attr('r', 5)
            markersG.append('circle').attr('class', 'marker y').attr('r', 5)
            markersG.append('circle').attr('class', 'marker z').attr('r', 5)

            markers.selectAll('circle')
                .attr('cx', function (d) { return x(d.date) })

            markers.selectAll('circle.x')
                .attr('cy', function (d) { return y(d.gyroscope.x) })

            markers.selectAll('circle.y')
                .attr('cy', function (d) { return y(d.gyroscope.y) })

            markers.selectAll('circle.z')
                .attr('cy', function (d) { return y(d.gyroscope.z) })

            markers.exit().remove()

            var contextMarkers = contextMarkersG.selectAll('line')
                .data(markersData)

            contextMarkers.enter().append('line')
                .attr('class', 'context-marker')

            contextMarkers
                .attr('x1', function (d) { return x2(d.date) })
                .attr('y1', height2)
                .attr('x2', function (d) { return x2(d.date) })
                .attr('y2', function (d) { return Math.round(y2(Math.max(d.gyroscope.x, d.gyroscope.y, d.gyroscope.z))) })

            contextMarkers.exit().remove()
        }

        this.updateChart()
    },

    componentDidUpdate: function (prevProps) { this.updateChart() },

    render: function () {
        if (this.props.data === undefined) return <div />
        else {

            var boardStatus = ''

            if (this.props.boardOnline !== undefined) {

                var statusStr = this.props.boardOnline
                    ? <span className="online">online</span>
                    : <span className="offline">offline</span>

                boardStatus = <span className="status">(Nucleo Board is {statusStr})</span>
            }

            return (
                <div className="temperature-chart-container">
                    <h1>Gyroscope Sensor {boardStatus}</h1>
                    <div className="magnetometer-chart" ref={this.initChart}/>
                </div>
            )
        }
    }
})

export default GyroscopeChart