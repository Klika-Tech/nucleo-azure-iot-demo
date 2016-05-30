var aws = require('aws-sdk');
var dynamo = new aws.DynamoDB();

exports.handler = function(event, context) {
    
    var params = {
        TableName: "nucleo-metrics",
        KeyConditionExpression: "metric = :m AND #ts >= :ts",
        ExpressionAttributeNames: {
            "#ts": "timestamp"
        },
        ExpressionAttributeValues: {
            ":m": {"S": "temperature"},
            ":ts": {"S": event.since}
        },
        ScanIndexForward: false,
        Limit: 20000
    }

    dynamo.query(params, function(err, data) {
        
        if (err) { context.fail(err); return }
        
        sensorData = data.Items.reverse().map(function(x) {
            var result = {
                timestamp: parseInt(x.timestamp.S)
            }
            
            var metrics = ['temperature', 'humidity', 'pressure', 'accelerometer', 'gyroscope', 'magnetometer']
            
            metrics.forEach(function(metric) {
                if (x.payload.M[metric] !== undefined)
                    if (x.payload.M[metric].N !== undefined)
                        result[metric] = parseFloat(x.payload.M[metric].N)
                    else if (x.payload.M[metric].L !== undefined) {
                        result[metric] = [
                                parseFloat(x.payload.M[metric].L[0].N),
                                parseFloat(x.payload.M[metric].L[1].N),
                                parseFloat(x.payload.M[metric].L[2].N)
                            ]
                    }
            })
            
            if (x.payload.M.marker !== undefined && x.payload.M.marker.BOOL)
                result.marker = true
            
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
                    ':c': {'N': city.id.toString()},
                    ':ts': {'N': event.since.toString()}
                },
                ScanIndexForward: false,
                Limit: 10000
            }
            
            dynamo.query(params, function(err, data) {
                
                if (err) { context.fail(err); return }
                
                weatherData.push({
                    cityName: city.name,
                    cityId: city.id,
                    tempData: data.Items.reverse().map(function(x) {
                        return {
                            timestamp: parseInt(x.timestamp.N),
                            temperature: parseFloat(x.temperature.N)
                        }
                    })
                })
              
                if (!cities.length)
                    context.succeed({sensorData: sensorData, weatherData: weatherData})
                else goThroughCities()
            })
        }
        
        goThroughCities()
    })
};
