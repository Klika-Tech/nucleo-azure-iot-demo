var React = require('react')
var d3 = require('d3')
var _ = require('lodash')

require('./temperature-chart.scss')

module.exports = React.createClass({

	prepareData: function() {

		return _.map(this.props.data, function(item) {

			return {
				temperature: item.temperature,
				date: new Date(item.timestamp * 1000),
				marker: item.marker
			}
		})
	},

	initChart: function(el) {

		if (!el) return

		var that = this

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
			.on('brushend', function() { that.updateChart() })

		var area = d3.svg.area()
			.interpolate('basis')
			.x(function(d) { return x(d.date) })
			.y0(height)
			.y1(function(d) { return y(d.temperature) })

		var area2 = d3.svg.area()
			.interpolate('linear')
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

		var focusMarkersG = focus.append('g')
			.attr('class', 'markers')

		var markerTooltip = d3.select(el).append('div')
			.attr('class', 'tooltip')

		var focusXAxis = focus.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')

		var focusYAxis = focus.append('g')
			.attr('class', 'y axis')

		var contextPath = context.append('path')
			.attr('class', 'area')

		var contextMarkersG = context.append('g')
			.attr('class', 'context-markers')

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

			if (brush.empty()) {
				x.domain([Date.now() - 300000, xDomain[1]])
			} else x.domain(brush.extent())

			var focusData = _.filter(data, function(d) {
				return d.date >= x.domain()[0] && d.date <= x.domain()[1]
			})

			y.domain([
					Math.floor((d3.min(focusData.map(function(d) { return d.temperature })) - .3) * 30) / 30,
					Math.ceil((d3.max(focusData.map(function(d) { return d.temperature })) + .3) * 30) / 30
				])

			console.log(y.domain())

			x2.domain(xDomain)
			y2.domain([
					Math.floor(d3.min(data.map(function(d) { return d.temperature })) - .5),
					Math.ceil(d3.max(data.map(function(d) { return d.temperature })))
				])

			focusPath.datum(data).attr('d', area)
			contextPath.datum(data).attr('d', area2)
			focusXAxis.call(xAxis)
			focusYAxis.call(yAxis)
			contextXAxis.call(xAxis2)

			if (!brush.empty())
				brush.extent(x.domain())(context.select('.brush'))

			var markersData = _.filter(data, function(d) {
				return d.marker
			})

			var focusMarkersData = _.filter(markersData, function(d) {
				return d.date >= x.domain()[0] && d.date <= x.domain()[1]
			})

			var markers = focusMarkersG.selectAll('circle')
				.data(focusMarkersData)

			markers.enter().append('circle')
				.attr('class', 'marker')
				.attr('r', 5)
				.on('mouseover', function(d) {
						markerTooltip
							.text(Math.round(d.temperature * 100) / 100 + "C @"
								+ d3.time.format('%X')(d.date))
							.style('left', (d3.event.pageX) + 'px')
							.style('top', (d3.event.pageY - 28) + 'px')
							.style('display', 'block')
					})
				.on('mouseout', function(d) {
						markerTooltip.style('display', 'none')
					})

			markers
				.attr('cx', function(d) { return x(d.date) })
				.attr('cy', function(d) { return y(d.temperature) })

			markers.exit().remove()

			var contextMarkers = contextMarkersG.selectAll('line')
				.data(markersData)

			contextMarkers.enter().append('line')
				.attr('class', 'context-marker')

			contextMarkers
				.attr('x1', function(d) { return x2(d.date) })
				.attr('y1', height2)
				.attr('x2', function(d) { return x2(d.date) })
				.attr('y2', function(d) { return Math.round(y2(d.temperature)) })

			contextMarkers.exit().remove()
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
