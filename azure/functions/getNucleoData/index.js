const { DocumentClient } = require('documentdb');
const config = require('./config');
const cities = [
    { name: 'Minsk', id: 625144 },
    { name: 'New York', id: 5128638 },
    { name: 'Los Angeles', id: 5368361 },
    { name: 'Seattle', id: 5809844 },
    { name: 'Chicago', id: 4887398 },
    { name: 'Washington DC', id: 4140963 },
    { name: 'Miami', id: 4164138 },
    { name: 'San Francisco', id: 5391959 },
    { name: 'London', id: 2643743 },
    { name: 'Madrid', id: 3117735 },
    { name: 'Milan', id: 3173435 },
    { name: 'Rome', id: 3169070 },
    { name: 'Berlin', id: 2950158 },
    { name: 'Prague', id: 3067696 },
    { name: 'Paris', id: 2988507 },
    { name: 'Moscow', id: 524901 }
];

function getCityData(client, since, city) {
    const link = `dbs/${config.dbName}/colls/${config.dbCitiesCollection}`;
    const query = `SELECT TOP 10000 * FROM ${config.dbCitiesCollection} AS w WHERE w.timestamp>='${since}' AND w.city=${city.id} ORDER BY w.timestamp ASC`;
    return new Promise((resolve, reject) => {
        client.queryDocuments(link, query).toArray((err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve({ city, items: results });
            }
        });
    });
}

function getCitesData(client, since) {
    const weatherDataPromises = cities.map(city => (getCityData(client, since, city)));
    return Promise.all(weatherDataPromises).then((citiesData) => {
        return citiesData.map((cdi) => ({
            cityName: cdi.city.name,
            cityId: cdi.city.id,
            tempData: cdi.items.map((x) => ({
                timestamp: x.timestamp,
                temperature: x.temperature
            })),
            humidityData: cdi.items.filter(x => x.humidity !== undefined).map((x) => ({
                timestamp: x.timestamp,
                humidity: x.humidity
            })),
            pressureData: cdi.items.filter(x => x.pressure !== undefined).map((x) => ({
                timestamp: x.timestamp,
                pressure: x.pressure
            }))
        }));
    });
}

function getSensorsData(client, since) {
    const link = `dbs/${config.dbName}/colls/${config.dbSensorsCollection}`;
    const query = `SELECT TOP 10000 * FROM ${config.dbSensorsCollection} AS m WHERE m.timestamp>='${since}' ORDER BY m.timestamp ASC`;
    const loadPromise = new Promise((resolve, reject) => {
        client.queryDocuments(link, query).toArray((err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
    return loadPromise.then((results) => {
        const metrics = ['temperature', 'humidity', 'pressure', 'accelerometer', 'gyroscope', 'magnetometer'];
        return results.map((x) => {
            const result = {
                timestamp: x.timestamp
            };
            metrics.forEach((metric) => {
                if (x[metric] !== undefined)
                    result[metric] = x[metric]
            });
            if (x.marker !== undefined && x.marker) result.marker = true;
            return result;
        });
    });
}

function sendJson(context, data) {
    context.res = {
        body: data,
        headers: { 'Content-Type': 'application/json' }
    };
    context.done();
}

module.exports = function(context, req) {
    let defaultSince = new Date();
    defaultSince = defaultSince.getTime() - (4 * 60 * 60 * 1000);
    const sinceTimestamp = req.query.since || defaultSince;
    const since = (new Date(sinceTimestamp)).toISOString();
    const client = new DocumentClient(config.dbHost, {masterKey: config.dbMasterKey});
    const weatherDataPromise = getCitesData(client, since);
    const sensorDataPromise = getSensorsData(client, since);
    const promise = Promise.all([weatherDataPromise, sensorDataPromise]);
    promise.then(
        (data) => {
            sendJson(context, {weatherData: data[0], sensorData: data[1]});
        },
        (err) => {
            sendJson(context, {error: err});
        }
    );
};