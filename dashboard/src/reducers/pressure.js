import { PRESSURE_UPDATE } from '../actionTypes';

export default function (state = {}, { type, payload }) {
    switch (type) {
    case PRESSURE_UPDATE: {
        return payload;
    }
    default:
        return state;
    }
}
