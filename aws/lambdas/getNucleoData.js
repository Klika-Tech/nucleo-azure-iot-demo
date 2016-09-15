import aws from 'aws-sdk'
const dc = new aws.DynamoDB.DocumentClient();

export function handler(event, context, callback) {
    
    var params = {
        TableName: "nucleo-metrics",
        KeyConditionExpression: "metric = :m AND #ts >= :ts",
        ExpressionAttributeNames: {
            "#ts": "timestamp"
        },
        ExpressionAttributeValues: {
            ":m": "temperature",
            ":ts": event.since.toString()
        },
        ScanIndexForward: false,
        Limit: 20000
    }

    dc.query(params, function(err, data) {
        
        if (err) { callback(err); return }
        
        const sensorData = data.Items.reverse().map(function(x) {
            var result = {
                timestamp: parseInt(x.timestamp)
            }
            
            var metrics = ['temperature', 'humidity', 'pressure', 'accelerometer', 'gyroscope', 'magnetometer']
            
            metrics.forEach(function(metric) {
                if (x.payload[metric] !== undefined)
                        result[metric] = x.payload[metric]
            })
            
            if (x.payload.marker !== undefined && x.payload.marker) result.marker = true
            
            return result
        })
        
        var cities = [
            {name: 'Minsk', id: 625144},
            {name: 'New York', id: 5128638},
            {name: 'Los Angeles', id: 5368361},
            {name: 'Seattle', id: 5809844},
            {name: 'Chicago', id: 4887398},
            {name: 'Washington DC', id: 4140963},
            {name: 'Miami', id: 4164138},
            {name: 'San Francisco', id: 5391959},
            {name: 'London', id: 2643743},
            {name: 'Madrid', id: 3117735},
            {name: 'Milan', id: 3173435},
            {name: 'Rome', id: 3169070},
            {name: 'Berlin', id: 2950158},
            {name: 'Prague', id: 3067696},
            {name: 'Paris', id: 2988507},
            {name: 'Moscow', id: 524901}
        ]
        
        var weatherData = []
        
        var goThroughCities = function () {
            
            var city = cities.shift()
        
            var params = {
                TableName: 'nucleo-weather',
                KeyConditionExpression: 'city = :c AND #ts >= :ts',
                ExpressionAttributeNames: {
                    '#ts': 'timestamp'
                },
                ExpressionAttributeValues: {
                    ':c': city.id,
                    ':ts': parseInt(event.since)
                },
                ScanIndexForward: false,
                Limit: 10000
            }
            
            dc.query(params, function(err, data) {
                
                if (err) { callback(err); return }
                
                weatherData.push({
                    cityName: city.name,
                    cityId: city.id,
                    tempData: data.Items.reverse().map(function(x) {
                        console.log(x)
                        return {
                            timestamp: x.timestamp,
                            temperature: x.temperature
                        }
                    }),
                    humidityData: data.Items.filter(x => x.humidity !== undefined).reverse().map(function(x) {
                        return {
                            timestamp: x.timestamp,
                            humidity: x.humidity
                        }
                    }),
                    pressureData: data.Items.filter(x => x.pressure !== undefined).reverse().map(function(x) {
                        return {
                            timestamp: x.timestamp,
                            pressure: x.pressure
                        }
                    })
                })
              
                if (!cities.length)
                    callback(null, {sensorData: sensorData, weatherData: weatherData})
                else goThroughCities()
            })
        }
        
        goThroughCities()
    })
};
