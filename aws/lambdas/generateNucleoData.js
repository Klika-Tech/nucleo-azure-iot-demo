var aws = require('aws-sdk')
var dynamo = new aws.DynamoDB()
var iotData = new aws.IotData({endpoint: "A1YBEPOVZYYAZ5.iot.us-east-1.amazonaws.com"})

exports.handler=  function(event, context) {
    
    var params = {
        TableName: "nucleo-metrics",
        KeyConditionExpression: "metric = :m",
        ExpressionAttributeValues: {
            ":m": {"S": "temperature"},
        },
        ScanIndexForward: false,
        Limit: 1
    }

    dynamo.query(params, function(err, data) {
        
        if (err) {
            context.fail(err)
            return
        }
        
        var lastTemp = parseFloat(data.Items[0].payload.M.temperature.N)
        
        var newTemp = lastTemp
        
        var rnd = Math.random()
        var shift = .03
        
        if (lastTemp > 40) shift *= 2
        else if (lastTemp < -20) shift *= -2
        
        if (rnd < .3) newTemp = newTemp + Math.random() * .06 - shift

        var params
            
        if (event.marker) {
        
            if (rnd > .25) {
                context.succeed()
                return
            }
        
            params = {
                topic: "Nucleo/data",
                payload: "{\"temperature\": " + newTemp + ", \"marker\": true}"
            }
            
        } else
            params = {
                topic: "$aws/things/Nucleo/shadow/update",
                payload: "{\"state\": {\"reported\": {\"temperature\": " + newTemp + "}}}"
            }

        iotData.publish(params, function(err, data) {
            if (err) context.fail(err)
            else context.succeed()
        })
    })
}
