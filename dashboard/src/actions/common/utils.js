import _ from 'lodash';

export function getActualData(data) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return _(data)
        .filter(item => item.date.getTime() >= yesterday.getTime())
        .value();
}
