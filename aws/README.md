# Nucleo Board Demo Platform Back-end Setup Guide

The demo platform is entirely powered by [Amazon Web Services](http://aws.amazon.com/). If you don't have an AWS account, create one. Amazon provides the [AWS Free Tier](https://aws.amazon.com/free/) for new accounts. The demo platform is lightweight and should fit into the free tier limits.

There is a number of Amazon services to be configured for the Nucleo board demo platform:

1. [Amazon DynamoDB](#amazon-dynamodb)
1. [AWS IoT](#aws-iot)
1. [AWS Lambda](#aws-lambda)
1. [Amazon Cognito](#amazon-cognito)
1. [Amazon S3](#amazon-s3)

## AWS DynamoDB

DynamoDB is used as a data storage for the demo platform. We will need two tables: one for sensor data and one for weather data.

Create the sensor data table with the following parameters:
- Name: `nucleo-metrics`
- Primary partition key: `metric` (String)
- Primary sort key: `timestamp` (String)

Create the weather data table with the following parameters:
- Name: `nucleo-weather`
- Primary partition key: `city` (Number)
- Primary sort key: `timestamp` (Number)

In fact, you can use any table names but don't forget change them in lambdas code as well.

## AWS IoT

AWS IoT works as a middleware between the "things" (Nucleo board in our case) and other system components.

Open the AWS IoT console and create the following resources (click on "Create a resource" button):

1. **Thing**. Name is the only required parameter here. Name the thing whatever you like (i.e. Nucleo). The thing will reflect the Nucleo board status.
1. **Policy**. The policy defines access rules for the thing. Give it any name and set the parameters:
  - Action: `iot:*`
  - Resource: `*`
  - Allow: checked
1. **Certificate**. The thing uses the certificate for authentication. Please see the [Nucleo board software readme](../nucleo/README.md) for details on how to generate a CSR. As soon as you get the CSR, upload it by clicking "Create with CSR". Amazon will sign a certificate for you. After the certificate is added, click on it in the IoT console and attach the thing and the policy.
1. **Rules**. We will need two rules:
  1. A rule to store **sensor data** to DynamoDB. Click "Create a rule" and set the following parameters:
    - Name: any, i.e. `store_temperature`
	- Attribute: `state.reported.temperature, timestamp`
	- Topic filter: `$aws/things/Nucleo/shadow/update/accepted`
	- Choose an Action: Insert message into a database table (DynamoDB)
	- Table name: select the sensor data table created earlier
	- Hash key value: `temperature`
	- Range key value: `${metadata.reported.temperature.timestamp}`
	- Payload field: `payload`
	- Role name: click "Create new role" then click "Allow". This will generate a AWS IAM role which allows writing to the table.

    Click "Add action" to create the action. For this rule we will need to create another action. Select "Republish this item to another topic" and set `Nucleo/data` as the target topic then click "Add action" again. After that submit the rule by clicking "Create" button.
  1. A rule to store **markers**. Click "Create a rule" and set the following parameters:
    - Name: any, i.e. `store_markers`
	- Attribute: `*`
	- Topic filter: `Nucleo/data`
	- Condition: `marker = true`
	- Choose an Action: Insert message into a database table (DynamoDB)
	- Table name: select the sensor data table created earlier
	- Hash key value: `temperature`
	- Range key value: `${timestamp() / 1000}`
	- Payload field: `payload`
	- Role name: select the role you generated for the previous rule

## AWS Lambda

There are three Lambdas to set up. See the [lambdas folder](lambdas/) for their sources.

Open the AWS Lambda console and create a lambda for each file. Copy and paste the file contents to the respective lambda.

## Amazon Cognito

We use Amazon Cognito to provide public read only access to IoT data streams.

The configuration here is pretty simple. Create a new identity pool. Give it any name and set the "Enable access to unauthenticated identities" checkbox. 

## Amazon S3

The web dashboard is a static web application which can be hosted on Amazon S3. Just create a bucket and configure it as described in [this guide](https://docs.aws.amazon.com/AmazonS3/latest/dev/HowDoIWebsiteConfiguration.html).
