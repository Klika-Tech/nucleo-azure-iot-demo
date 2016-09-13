import config from '../config'

import aws from 'aws-sdk'
const dynamo = new aws.DynamoDB()
const iotData = new aws.IotData({endpoint: config.iotEndpoint})

export function handler(event, context, callback) {

    const params = {
        TableName: 'nucleo-metrics',
        KeyConditionExpression: 'metric = :m',
        ExpressionAttributeValues: {
            ':m': {'S': 'temperature'},
        },
        ScanIndexForward: false,
        Limit: 1
    }

    dynamo.query(params, (err, data) => {
        
        if (err) {
            callback(err)
            return
        }

        const lastTemp = parseFloat(data.Items[0].payload.M.temperature.N)
        
        let newTemp = lastTemp

        const rnd = Math.random()
        let shift = .03
        
        if (lastTemp > 40) shift *= 2
        else if (lastTemp < -20) shift *= -2
        
        if (rnd < .3) newTemp = newTemp + Math.random() * .06 - shift

        let params
            
        if (event.marker) {
        
            if (rnd > .25) return
        
            params = {
                topic: 'Nucleo/data',
                payload: JSON.stringify({
                    temperature: newTemp,
                    marker: true
                })
            }
            
        } else
            params = {
                topic: '$aws/things/Nucleo/shadow/update',
                payload: JSON.stringify({
                    state: {
                        reported: {
                            temperature: newTemp
                        }
                    }
                })
            }

        iotData.publish(params, err => {
            if (err) callback(err)
        })
    })
}
