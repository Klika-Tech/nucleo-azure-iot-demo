import React from 'react'
import d3 from 'd3'
import _ from 'lodash'

import './temperature-chart.scss'

const HumidityChart = React.createClass({

	getInitialState: function() {
		return {
			chartParams: {
				chartType: 'area'
			}
		}
	},

	prepareData: function(data) {

		return _(data)
				.map(function(item) {

					return {
						humidity: item.humidity,
						date: new Date(item.timestamp * 1000)
					}
				})
				.value()
	},

	initChart: function(el) {

		if (!el) return

		var that = this

		var margin, width,	height

		var focusData

		var x = d3.time.scale(),
			y = d3.scale.linear()

		var xAxis = d3.svg.axis().orient('bottom'),
			yAxis = d3.svg.axis().orient('right')

		var svg = d3.select(el).append('svg')

		var rect = svg.append('defs').append('clipPath')
				.attr('id', 'clip')
			.append('rect')

		var focus = svg.append('g')
			.attr('class', 'focus')

		var focusBg = focus.append('rect')
			.attr('class', 'focus-bg')
			.attr('x', 0)
			.attr('y', 0)

		var focusPath = focus.append('path')

		var focusXAxis = focus.append('g')
			.attr('class', 'x axis')

		var focusYAxis = focus.append('g')
			.attr('class', 'y axis')

		var setDimensions

		(setDimensions = function() {

			var container = el.getBoundingClientRect()

			margin = {top: 0, right: 0, bottom: 20, left: 0}
			width = container.width - margin.left - margin.right
			height = container.height - margin.top - margin.bottom

			x.range([0, width])
			y.range([height, 0])

			xAxis.scale(x).ticks(4)

			yAxis
				.scale(y)
				.ticks(4)
				.tickSize(0)
				.tickFormat(function(v) {
					return `${y.tickFormat()(v)}%`
				})

			svg
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)

			rect
				.attr('width', width)
				.attr('height', height)

			focus.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			focusBg.attr('width', width)
				.attr('height', height)
			focusXAxis.attr('transform', 'translate(0,' + height + ')')
		})()

		d3.select(window).on('resize.humidity', function() {
			setDimensions()
			that.updateChart()
		})


		this.updateChart = function() {

			var data = this.prepareData(this.props.data)

			var xDomain = d3.extent(data.map(function(d) { return d.date }))

			x.domain(xDomain)

			var bisector = d3.bisector(function(d) { return d.date }).right

			focusData = data.slice(
				Math.max(0, bisector(data, x.domain()[0]) - 1),
				Math.min(data.length, bisector(data, x.domain()[1]) + 1)
			)

			y.domain([
					Math.floor((d3.min(focusData.map(function(d) { return d.humidity })) - .3) * 30) / 30,
					Math.ceil((d3.max(focusData.map(function(d) { return d.humidity })) + .3) * 30) / 30
				])

			var focusPathGenerator = (this.state.chartParams.chartType == 'area'
				? d3.svg.area()
					.y0(height)
					.y1(function(d) { return y(d.humidity) })
				: d3.svg.line()
					.y(function(d) { return y(d.humidity) })
				)
					.interpolate('monotone')
					.x(function(d) { return x(d.date) })

			focusPath
				.datum(data)
				.attr('d', focusPathGenerator)
				.attr('class', this.state.chartParams.chartType == 'area' ? 'area' : 'line')
			focusXAxis.call(xAxis)

			focusYAxis
				.call(yAxis)
				.selectAll('text')
					.attr('x', 4)
					.attr('dy', -4)
		}

		this.updateChart()
	},

	componentDidUpdate: function(prevProps) { this.updateChart() },

	render: function() {
		if (this.props.data === undefined) return <div />
		else return (
				<div className="temperature-chart-container">
					<div className="temperature-chart simple" ref={this.initChart} />
				</div>
			)
	}
})

export default HumidityChart