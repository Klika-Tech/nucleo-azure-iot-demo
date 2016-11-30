import { DATA_FETCHED } from '../actionTypes';

/**
 * fetched = false;
 * */
export default function (state = {}, { type }) {
    switch (type) {
    case DATA_FETCHED: {
        return { fetched: true };
    }
    default:
        return state;
    }
}
