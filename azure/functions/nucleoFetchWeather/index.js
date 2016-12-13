const http = require('http');
const { DocumentClient } = require('documentdb');
const config = require('./config');
const timeStamp = new Date().toISOString();
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
const cityIds = cities
    .map(function (d) {
        return d.id
    })
    .reduce(function (prev, cur) {
        return prev + ',' + cur
    });

function getColLink() {
    return 'dbs/nucleo-data/colls/weather';
}

function insertDocuments(client, collLink, documents) {
    const promises = documents.map(document => {
        return new Promise((resolve, reject) => {
            client.upsertDocument(collLink, document, function (err, doc) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doc)
                }
            });
        })
    });
    return Promise.all(promises);
}

module.exports = function (context, timer) {
    if(timer.isPastDue) {
        context.log('Function is running late!');
    }
    const client = new DocumentClient(config.dbHost, {masterKey: config.dbMasterKey});
    const apiUrl = 'http://api.openweathermap.org/data/2.5/group?id=' + cityIds + '&units=metric&appid=' + config.owmApiKey;
    context.log('Fetch url:', apiUrl);
    http.get(
        apiUrl,
        (res) => {
            let data = '';
            res.on('data', function(chunk) {
                data += chunk
            });
            res.on('end', function() {
                context.log('Data fetched successfully:', timeStamp);
                data = JSON.parse(data);
                data = data.list.map(function(d) {
                    const dateTime = new Date(d.dt * 1000);
                    return {
                        city: d.id,
                        timestamp: dateTime.toISOString(),
                        temperature: d.main.temp,
                        humidity: d.main.humidity,
                        pressure: d.main.pressure
                    }
                });
                insertDocuments(client, getColLink(), data).then(
                    (inserted) => {
                        context.log('Data inserted successfully:', inserted.length);
                        context.done();
                    },
                    (error) => {
                        context.log('Data insert error:', JSON.stringify(error));
                        context.done();
                    }
                );
            });

        }).on('error', (err) => {
        console.log('Data fetch error:', err);
        context.done();
    });
};

