# Nucleo Board Demo Platform

The platform demonstrates a Nucleo board with AWS IoT integration use case. The major platform components are:

1. [**STM32 Nucleo-64 board**](http://www2.st.com/content/st_com/en/products/evaluation-tools/product-evaluation-tools/mcu-eval-tools/stm32-mcu-eval-tools/stm32-mcu-nucleo.html?querycriteria=productId=LN1847) with [WiFi](http://www2.st.com/content/st_com/en/products/ecosystems/stm32-open-development-environment/stm32-nucleo-expansion-boards/stm32-ode-connect-hw/x-nucleo-idw01m1.html) and [sensors](http://www2.st.com/content/st_com/en/products/ecosystems/stm32-open-development-environment/stm32-nucleo-expansion-boards/stm32-ode-sense-hw/x-nucleo-iks01a1.html) expansions. The board is a "thing" for the AWS IoT service. It updates its shadow with the temperature sensor data every 5 seconds. 
1. **AWS-powered back-end** recieves the temperature data, stores it in a DB and provides an API for the data retrieval.
1. **Web dashboard** uses the API to fetch and visualize the temperature data
1. **Android app** is another front-end. It fetches and displays the temperature data as well.

Here is the overall platform scheme:

![Nucleo Board Demo Platform Scheme](doc/scheme.png)

## Nucleo Board

The board is registered as a "thing" in AWS IoT. It connects via MQTT broker and sends temperature data every 5 seconds by updating its [shadow](http://docs.aws.amazon.com/iot/latest/developerguide/iot-thing-shadows.html).

Additionally the board sends a special marker message on user button press to another MQTT topic. These markers are then visualized on the temperature chart.

Please see the board software [source code](nucleo/) for implementation, configuration details and build instructions.

## Back-end

The back-end is entirely powered by Amazon Web Services. The following services are used:

1. [AWS IoT](https://aws.amazon.com/iot/) is used to communicate with the Nucleo board as well as process data coming from the device. The data is automatically processed by AWS IoT Rules Engine.
1. [AWS Lambda](https://aws.amazon.com/lambda/) is the computing component of the platform. Lambdas are used to process the data by the IoT rules engine and to implement business logic for the API. There is also a "bot" implemented on Lambdas. The bot emulates the Nucleo board and can be used when the board is not available and for debugging. In addition to processing the Nucleo board data a Lambda is used to fetch temperature data for a number of cities from [OpenWeatherMap](http://openweathermap.org/) API.
1. [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) is a key-value storage where the data is persisted by the IoT rules engine and Lambdas.
1. The API is powered by [Amazon API Gateway](https://aws.amazon.com/api-gateway/).
1. [Amazon CloudWatch](http://aws.amazon.com/cloudwatch/) is used as a scheduler.
1. [Amazon Cognito](http://aws.amazon.com/cognito/) is used to provide read-only public access to IoT data streams via MQTT over Websockets for the web dashboard and Android app.
1. The web dashboard is hosted on [Amazon S3](http://aws.amazon.com/s3/).

Please see the [AWS setup guide](aws/README.md) for details.

## Web Dashboard

The dashboard is a demo front-end implemented as a web application. It is a [React](https://facebook.github.io/react/) application which renders the Nucleo board temperature data as a [D3.js](https://d3js.org/) chart.

On the application start, initial data set is fetched from a public API endpoint. By default the last 24 hours of data is rendered. The chart is updated in real time using the data coming from AWS IoT via MQTT over Websocket protocol.

The chart has two visualization modes: line and area. There is also an online/offline indicator for the Nucleo board.

Please see the web dashboard [source code](dashboard/) for the implementations details, configuration and build instructions.

## Android App

The Android app is another front-end. Its functionality resembles that of the web dashboard.

Please see the app [source code](android/) for the implementations details, configuration and build instructions.
