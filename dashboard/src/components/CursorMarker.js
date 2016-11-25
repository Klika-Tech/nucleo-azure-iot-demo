import React, { PropTypes } from 'react';

const MARKER_SIZE = 10;

const CursorMarker = ({ data, y, children }) => {
    let top = (data) ? y(data) : 0;
    top -= (MARKER_SIZE / 2);
    const style = {
        left: `${-(MARKER_SIZE / 2)}px`,
        top: `${top}px`,
    };
    return (
        <div className="cursor-point" style={style}>{children}</div>
    );
};

CursorMarker.propTypes = {
    data: PropTypes.object,
    y: PropTypes.func,
};

export default CursorMarker;
