/**
 * State shape:
 * data = [];
 * cursorIndex = 0;
 * cursorVisible = false;
 * cursorX = 0;
 * contextDomain = [];
 * focusDomain = [];
 * defaultFocusDomain = [];
 * yDomain = [];
 * brushSelection = [];
 * brushDomain = [];
 * */
export function focusMove(state, payload) {
    return {
        ...state,
        cursorVisible: true,
        cursorIndex: payload.cursorIndex,
        cursorX: payload.cursorX,
    };
}

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

export function focusOut(state) {
    return {
        ...state,
        cursorVisible: false,
    };
}
