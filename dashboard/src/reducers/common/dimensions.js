/**
 * State shape:
 * data = [];
 * */
export function update(state, { data }) {
    return {
        ...state,
        data,
    };
}
