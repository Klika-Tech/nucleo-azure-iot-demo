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