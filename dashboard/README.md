# Nucleo Board Demo Platform Web Dashboard

The dashboard is a demo front-end implemented as a web application. It is a [React](https://facebook.github.io/react/) application which renders the Nucleo board temperature data as a [D3.js](https://d3js.org/) chart.

## Build Instructions

In order to build the application perform the following:

1. [Install Node.js](https://docs.npmjs.com/getting-started/installing-node)
1. Run `npm install`. This will install the dependencies.
1. Rename `src/config.dist.js` to `src/config.js` and update the configuration parameters. See [AWS Setup Guide](../aws/README.md) for AWS parameters details.
1. Run `npm run build`. This will build the application. The application files are now in the `dist` folder.

## (optional) Deployment

One of the simplest hosting options is Amazon S3. In order to deploy the application to S3 do the following:

1. Configure an S3 bucket to host a website as described in the [AWS setup guide](../aws/README.md)
1. [Install and configure AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html)
1. Deploy the application files with the command `aws s3 sync dist/ s3://<your.bucket.name>/`
