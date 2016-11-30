import React from 'react';
import { render } from 'react-dom';
import AWS from 'exports?AWS!aws-sdk/dist/aws-sdk';
import { connectToAWS } from '../actions/mqtt';

/**
 * Connect to AWS IoT mqtt stream
 * @param dispatch
 * @param awsRegion
 * @param cognitoIdentityPool
 * @param iotEndpoint
 */
export function connect(dispatch, { awsRegion, cognitoIdentityPool, iotEndpoint }) {
    AWS.config.region = awsRegion;
    const awsCreds = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: cognitoIdentityPool,
    });
    awsCreds.get((err) => {
        if (err) {
            console.error(err);
            return;
        }
        dispatch(connectToAWS(
            awsRegion,
            iotEndpoint,
            awsCreds.accessKeyId,
            awsCreds.secretAccessKey,
            awsCreds.sessionToken,
        ));
    });
}
