var aws = require('aws-sdk')
var dynamo = new aws.DynamoDB()
var http = require('http')

exports.handler = function(event, context) {
    
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
        
    var appid = '3b7d7908a176d9bea104de439de274e1'
    
    var cityIds = cities
        .map(function(d) {return d.id})
        .reduce(function(prev,cur) { return prev + ',' + cur })

    http.get('http://api.openweathermap.org/data/2.5/group?id=' + cityIds + '&units=metric&appid=' + appid,
        function(res) {
            
            var data = ''
            
            res.on('data', function(chunk) {
                data += chunk
            })
            
            res.on('end', function() {
                data = JSON.parse(data)
                
                data = data.list.map(function(d) {
                    return {city: d.id, timestamp: d.dt, temperature: d.main.temp}
                })
                
                data.forEach(function(d) {
                    
                    var params = {
                        TableName: 'nucleo-weather',
                        Item: {
                            city: {N: d.city.toString()},
                            timestamp: {N: d.timestamp.toString()},
                            temperature: {N: d.temperature.toString()}
                        }
                    }
                    
                    dynamo.putItem(params, function(err) {
                      if (err) context.fail(err)
                    })
                })
                
                context.succeed()
            })
            
        }).on('error', function(err) {context.fail(err)})
}
