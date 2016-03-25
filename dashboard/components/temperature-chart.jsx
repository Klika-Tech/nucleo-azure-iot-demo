var React = require('react')
var d3 = require('d3')
var _ = require('lodash')

require('./temperature-chart.scss')

module.exports = React.createClass({

	prepareData: function() {

		return _.map(this.props.data, function(item) {

			return {
				temperature: item.temperature,
				date: new Date(item.timestamp * 1000)
			}
		})
	},

	initChart: function(el) {

		if (!el) return

		var brushed = function() {

			if (brush.empty()) {

				x.domain(x2.domain())
				y.domain(y2.domain())
				focusYAxis.call(yAxis)

			} else x.domain(brush.extent())

			focusPath.attr('d', area)
			focusXAxis.call(xAxis)
		}

		var margin = {top: 10, right: 10, bottom: 100, left: 40},
			margin2 = {top: 430, right: 10, bottom: 20, left: 40},
			width = 960 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom,
			height2 = 500 - margin2.top - margin2.bottom

		var x = d3.time.scale().range([0, width]),
			x2 = d3.time.scale().range([0, width]),
			y = d3.scale.linear().range([height, 0]),
			y2 = d3.scale.linear().range([height2, 0])

		var xAxis = d3.svg.axis().scale(x).orient('bottom'),
			xAxis2 = d3.svg.axis().scale(x2).orient('bottom'),
			yAxis = d3.svg.axis().scale(y).orient('left')

		var brush = d3.svg.brush()
			.x(x2)
			.clamp(true)
			.on('brush', brushed)

		var area = d3.svg.area()
			.interpolate('monotone')
			.x(function(d) { return x(d.date) })
			.y0(height)
			.y1(function(d) { return y(d.temperature) })

		var area2 = d3.svg.area()
			.interpolate('monotone')
			.x(function(d) { return x2(d.date) })
			.y0(height2)
			.y1(function(d) { return y2(d.temperature) })

		var svg = d3.select(el).append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)

		svg.append('defs').append('clipPath')
				.attr('id', 'clip')
			.append('rect')
				.attr('width', width)
				.attr('height', height)

		var focus = svg.append('g')
			.attr('class', 'focus')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

		var context = svg.append('g')
			.attr('class', 'context')
			.attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')')

		var focusPath = focus.append('path')
			.attr('class', 'area')

		var focusXAxis = focus.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')

		var focusYAxis = focus.append('g')
			.attr('class', 'y axis')

		var contextPath = context.append('path')
			.attr('class', 'area')

		var contextXAxis = context.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height2 + ')')

		context.append('g')
				.attr('class', 'x brush')
				.call(brush)
			.selectAll('rect')
				.attr('y', -6)
				.attr('height', height2 + 7)


		this.updateChart = function() {

			var data = this.prepareData()

			var xDomain = d3.extent(data.map(function(d) { return d.date }))
			var yDomain = [
				d3.min(data.map(function(d) { return d.temperature })) - 5,
				d3.max(data.map(function(d) { return d.temperature }))
			]

			if (brush.empty()) {
				x.domain(xDomain)
				y.domain(yDomain)
			}

			x2.domain(xDomain)
			y2.domain(yDomain)

			focusPath.datum(data).attr('d', area)
			contextPath.datum(data).attr('d', area2)
			focusXAxis.call(xAxis)
			focusYAxis.call(yAxis)
			contextXAxis.call(xAxis2)

			if (!brush.empty())
				brush.extent(x.domain())(context.select('.brush'))
		}

	},

	componentDidUpdate: function(prevProps) {

		this.updateChart()
	},

	render: function() {
		if (this.props.data === undefined) return <div />
		else return (
			<div>
				<h1>Temperature Sensor</h1>
				<div className="temperature-chart" ref={this.initChart} />
			</div>
		)
	}
})
