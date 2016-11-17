import * as d3 from 'd3'

export function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        let context = this;
        let args = arguments;
        let evt  = d3.event;

        let later = function() {
            timeout = null;
            if (!immediate) {
                let tmpEvent = d3.event;
                d3.event = evt;
                func.apply(context, args);
                d3.event = tmpEvent;
            }
        };

        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            let tmpEvent = d3.event;
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
 * */
export function lineOptimized() {

    let x = null, y = null;

    function line(data) {
        return 'M' + data.map(function(a) { return [~~x(a), ~~y(a)]; }).join('L');
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
