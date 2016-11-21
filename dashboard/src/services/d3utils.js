import * as d3 from 'd3';

/**
 * D3.js debounce function
 * @param func
 * @param wait
 * @param immediate
 * @return function
 * */
export function debounce(func, wait, immediate) {
    let timeout;
    return function (...args) {
        const context = this;
        const evt = d3.event;

        const later = function () {
            timeout = null;
            if (!immediate) {
                const tmpEvent = d3.event;
                d3.event = evt;
                func.apply(context, args);
                d3.event = tmpEvent;
            }
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            const tmpEvent = d3.event;
            d3.event = evt;
            func.apply(context, args);
            d3.event = tmpEvent;
        }
    };
}

/**
 * Optimized line path generator.
 * TODO: decide use or not.
 * @ref https://www.mapbox.com/osmdev/2012/11/20/getting-serious-about-svg/
 * @return function path generator
 * */
export function lineOptimized() {
    let x = null;
    let y = null;

    function line(data) {
        return `M${data.map(a => [~~x(a), ~~y(a)]).join('L')}`;
    }

    line.x = (_) => {
        x = _;
        return line;
    };

    line.y = (_) => {
        y = _;
        return line;
    };

    return line;
}
