# Nucleo Board Demo Platform

The platform demonstrates a Nucleo board with Azure IoT Services integration use case. The major platform components are:

1. [**STM32 Nucleo-64 board**](http://www2.st.com/content/st_com/en/products/evaluation-tools/product-evaluation-tools/mcu-eval-tools/stm32-mcu-eval-tools/stm32-mcu-nucleo.html?querycriteria=productId=LN1847) with [WiFi](http://www2.st.com/content/st_com/en/products/ecosystems/stm32-open-development-environment/stm32-nucleo-expansion-boards/stm32-ode-connect-hw/x-nucleo-idw01m1.html) and [sensors](http://www2.st.com/content/st_com/en/products/ecosystems/stm32-open-development-environment/stm32-nucleo-expansion-boards/stm32-ode-sense-hw/x-nucleo-iks01a1.html) expansions. The board is a "thing" for the AWS IoT service. It updates its shadow with the sensors data every second. 
1. **Azure-powered back-end** receives the data, stores it in a DB and provides an API for the data retrieval.
1. **Web dashboard** uses the API to fetch and visualize the data
1. **Android app** is another front-end. It fetches and displays the sensors data as well.

Here is the overall platform scheme:

![Nucleo Board Demo Platform Scheme](doc/scheme.png)

## Nucleo Board

The board is registered as a "thing" in Azure IoT Hub. It connects via MQTT to IoT Hub and sends sensors data every second.

Additionally the board sends a special marker message on user button press. These markers are then visualized on the charts.

Please see the board software [source code](nucleo/) for implementation, configuration details and build instructions.

## Back-end

The back-end is entirely powered by Microsoft Azure Cloud. The following services are used:

1. [Azure IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/) is used to communicate with the Nucleo board as well as process data coming from the device.
1. [Azure Stream Analytics](https://azure.microsoft.com/en-us/services/stream-analytics/) is used to automatically process data from [IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/) and save processed data in [DocumentDB](https://azure.microsoft.com/en-us/services/documentdb/).
1. [Azure DocumentDB](https://azure.microsoft.com/en-us/services/documentdb/) is a key-value storage where the data is persisted by the Steam Analytics engine and [Functions](https://azure.microsoft.com/en-us/services/functions/).
1. [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) is the computing component of the platform. [Functions](https://azure.microsoft.com/en-us/services/functions/) are used to process the data by the IoT Hub and to implement business logic for the API. There is also a "bot" implemented on Functions. The bot emulates the Nucleo board and can be used when the board is not available and for debugging. In addition to processing the Nucleo board data a [Functions](https://azure.microsoft.com/en-us/services/functions/) is used to fetch weather data for a number of cities from [OpenWeatherMap API](http://openweathermap.org/).
Also Functions provide build-in scheduler and HTTP API.
1. [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/) is used to provide read-only public access to IoT data streams via Websockets for the web dashboard.
1. The web dashboard is hosted as [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/).

Please see the [Azure setup guide](azure/README.md) for details.

## Web Dashboard

The dashboard is a demo front-end implemented as a web application. It is a [React](https://facebook.github.io/react/) application which renders the Nucleo board sensors data as [D3.js](https://d3js.org/) charts.

On the application start, initial data set is fetched from a public API endpoint. By default the last 4 hours of data is rendered. The chart is updated in real time using the data coming from AWS IoT via MQTT over Websocket protocol.

The charts have two visualization modes: line and area. There is also an online/offline indicator for the Nucleo board.

Please see the web dashboard [source code](dashboard/) for the implementations details and [build instruction](./dashboard/README.md).