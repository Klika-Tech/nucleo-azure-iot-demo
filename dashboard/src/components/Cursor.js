import React, { PropTypes } from 'react';

const Cursor = ({ children, x, y, height, visible }) => {
    const style = {
        top: `${y}px`,
        left: `${x}px`,
        height: `${height}px`,
        visibility: (visible) ? 'visible' : 'hidden',
    };
    return (
        <div className="cursor-focus" style={style}>
            {children}
        </div>
    );
};

Cursor.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    height: PropTypes.number,
    visible: PropTypes.bool,
};

export default Cursor;
