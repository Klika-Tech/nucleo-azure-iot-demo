import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';
import Cursor from '../../common/Cursor';
import CursorMarker from '../../common/CursorMarker';
import CursorTooltip from '../../common/CursorTooltip';

function DimensionsCursor({ data, cursorIndex, cursorVisible, cursorX, margin, height, width, y, units, type }) {
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
                y={d => y(d[type].x)}
            >
                <CursorTooltip cursorX={cursorX} containerWidth={width}>
                    {getTooltipText('x')}
                </CursorTooltip>
            </CursorMarker>

            <CursorMarker
                data={cursorData}
                y={d => y(d[type].y)}
            >
                <CursorTooltip cursorX={cursorX} containerWidth={width}>
                    {getTooltipText('y')}
                </CursorTooltip>
            </CursorMarker>

            <CursorMarker
                data={cursorData}
                y={d => y(d[type].z)}
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
            const value = Math.round(cursorData[type][axis] * 100) / 100;
            const date = timeFormat(cursorData.date);
            return `${axisLabel}: ${value}${units} @ ${date}`;
        }
        return '';
    }
}

DimensionsCursor.propTypes = {
    type: PropTypes.string,
    units: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.instanceOf(Date),
    })),
    cursorIndex: PropTypes.number,
    cursorX: PropTypes.number,
    cursorVisible: PropTypes.bool,
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

export default DimensionsCursor;

