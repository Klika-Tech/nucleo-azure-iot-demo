import 'whatwg-fetch';

/**
 * Load aws metrics for the last 4h
 * @param fetchApiUrl
 * @param fetchApiKey
 * @return {*|Promise.<Object>}
 */
export function fetchMetrics({ fetchApiUrl, fetchApiKey }) {
    const since = Math.round(Date.now() / 1000) - 14400;
    return fetch(`${fetchApiUrl}?code=${fetchApiKey}`)
        .then(response => response.json());
}
