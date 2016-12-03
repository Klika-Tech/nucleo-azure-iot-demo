/**
 * State shape:
 * data = [];
 * yDomain = [];
 * focusDomain = [];
 * contextDomain = [];
 * brushSelection = [];
 * brushDomain = [];
 * */
export function update(state, { data, contextDomain, focusDomain, yDomain, brushDomain, brushSelection }) {
    return {
        ...state,
        data,
        contextDomain,
        focusDomain,
        yDomain,
        brushDomain,
        brushSelection,
    };
}