import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { scaleTime, scaleLinear } from 'd3-scale';
import './realtime-chart.scss';
import Cursor from './Cursor';
import CursorMarker from './CursorMarker';
import CursorTooltip from './CursorTooltip';

function AccelerometerFocus({ data, cursorIndex, cursorVisible, cursorX, margin, height, width, y }) {
    const cursorData = data[cursorIndex];
    return (
        <Cursor
            y={margin.top}
            x={cursorX}
            height={height}
            visible={cursorVisible}
        >
            <CursorMarker
                data={cursorData}
                y={d => y(d.accelerometer.x)}
            >
                <CursorTooltip cursorX={cursorX} containerWidth={width}>
                    {getTooltipText('x')}
                </CursorTooltip>
            </CursorMarker>

            <CursorMarker
                data={cursorData}
                y={d => y(d.accelerometer.y)}
            >
                <CursorTooltip cursorX={cursorX} containerWidth={width}>
                    {getTooltipText('y')}
                </CursorTooltip>
            </CursorMarker>

            <CursorMarker
                data={cursorData}
                y={d => y(d.accelerometer.z)}
            >
                <CursorTooltip cursorX={cursorX} containerWidth={width}>
                    {getTooltipText('z')}
                </CursorTooltip>
            </CursorMarker>

        </Cursor>
    );
    function getTooltipText(axis) {
        const timeFormat = d3.timeFormat('%X');
        if (cursorData) {
            const axisLabel = axis.toUpperCase();
            const value = Math.round(cursorData.accelerometer[axis] * 100) / 100;
            const date = timeFormat(cursorData.date);
            return `${axisLabel}: ${value}g @ ${date}`;
        }
        return '';
    }
}

AccelerometerFocus.propTypes = {
    margin: PropTypes.shape({
        left: PropTypes.number,
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
    }),
    height: PropTypes.number,
    width: PropTypes.number,
    y: PropTypes.func,
};

export default connect(state => ({
    data: state.accelerometer.data,
    cursorIndex: state.accelerometer.cursorIndex,
    cursorVisible: state.accelerometer.cursorVisible,
    cursorX: state.accelerometer.cursorX,
}))(AccelerometerFocus);

