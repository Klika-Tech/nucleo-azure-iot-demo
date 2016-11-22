import React from 'react';
import { render } from 'react-dom';
import AWS from 'exports?AWS!aws-sdk/dist/aws-sdk';
import mqtt from 'mqtt';
import * as SigV4Utils from './awsSignService';

/**
 * @module AwsMqttFactory
 * */

/**
 * Configure and run MQTT instance.
 * @param awsRegion
 * @param apiUrl
 * @param cognitoIdentityPool
 * @param iotEndpoint
 * @param mqttTopic
 * @param debug
 * @return {Promise<MqttClient>}.
 */
export function getInstance({ awsRegion, apiUrl, cognitoIdentityPool, iotEndpoint, mqttTopic, debug }) {
    return new Promise((resolve, reject) => {
        AWS.config.region = awsRegion;
        const awsCreds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: cognitoIdentityPool,
        });
        awsCreds.get((err) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            const url = SigV4Utils.getSignedUrl(
                'wss',
                iotEndpoint,
                '/mqtt',
                'iotdevicegateway',
                awsRegion,
                awsCreds.accessKeyId,
                awsCreds.secretAccessKey,
                awsCreds.sessionToken);
            // There is no way to disable auto-reconnect in mqtt so setting the
            // reconnect period to max value
            const client = mqtt.connect(url, { reconnectPeriod: 2147483647 });
            client.on('connect', () => {
                if (debug) console.log('MQTT client disconnected');
                client.subscribe(mqttTopic);
                // There is a limit on AWS side on websocket connection duration (5 minutes)
                // So we're closing the connection in advance
                setTimeout(() => {
                    client.end();
                }, 270000); // 4.5 minutes
            });
            client.on('close', () => {
                if (debug) console.log('MQTT client disconnected');
                client.end();
                setTimeout(() => {
                    if (debug) console.log('Reconnecting');
                    getInstance({ awsRegion, apiUrl, cognitoIdentityPool, iotEndpoint, mqttTopic, debug });
                }, 1000);
            });
            resolve(client);
        });
    });
}
