import React from 'react';
import { render } from 'react-dom';
import AWS from 'exports?AWS!aws-sdk/dist/aws-sdk';
import mqtt from 'mqtt';
import * as dataService from './iotData';
import * as SigV4Utils from './sigv4utils';
import config from '../config';

export default function init() {
    AWS.config.region = config.awsRegion;
    const awsCreds = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: config.cognitoIdentityPool,
    });

    awsCreds.get((err) => {
        if (err) {
            console.log(err);
            return;
        }
        const url = SigV4Utils.getSignedUrl(
            'wss',
            config.iotEndpoint,
            '/mqtt',
            'iotdevicegateway',
            config.awsRegion,
            awsCreds.accessKeyId,
            awsCreds.secretAccessKey,
            awsCreds.sessionToken);

        // There is no way to disable auto-reconnect in mqtt so setting the
        // reconnect period to max value
        const client = mqtt.connect(url, { reconnectPeriod: 2147483647 });

        client.on('connect', () => {
            client.subscribe(config.mqttTopic);

            // There is a limit on AWS side on websocket connection duration (5 minutes)
            // So we're closing the connection in advance
            setTimeout(() => {
                client.end();
            }, 270000); // 4.5 minutes
        });

        client.on('message', (topic, m) => {
            const msg = m.toString();

            // if (config.debug)
            //     console.info('Message recieved.\nTopic: %s\nPayload: %s', topic, msg);

            if (topic === config.mqttTopic) {
                dataService.pushSensorData(JSON.parse(msg));
            }
        });

        client.on('close', () => {
            console.log('MQTT client disconnected');

            client.end();

            setTimeout(() => {
                console.log('Reconnecting');
                init();
            }, 1000);
        });
    });
}
