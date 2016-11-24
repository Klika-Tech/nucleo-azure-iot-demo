import { FETCH_DATA, PUSH_DATA } from '../actionTypes';

export function fetchData(data) {
    return {
        type: FETCH_DATA,
        payload: data,
    };
}

export function pushData(chunk) {
    return {
        type: PUSH_DATA,
        payload: chunk,
    };
}

