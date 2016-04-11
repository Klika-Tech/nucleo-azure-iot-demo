# AWS IoT Sample App.
###### _version 0.2_
## Files
### Aws IoT config
*aws_iot_config.h* - **configuration for AWS connection**

    #define AWS_IOT_MQTT_HOST               "A1YBEPOVZYYAZ5.iot.us-east-1.amazonaws.com"
    #define AWS_IOT_MQTT_PORT               8883
    #define AWS_IOT_MQTT_CLIENT_ID          "Nucleo"
    #define AWS_IOT_MY_THING_NAME           "Nucleo"
###### NOTE: In this application below settings produce no effect.
    #define AWS_IOT_ROOT_CA_FILENAME        "root-CA.crt"
    #define AWS_IOT_CERTIFICATE_FILENAME    "132c58eafa-certificate.pem.crt"
    #define AWS_IOT_PRIVATE_KEY_FILENAME    "132c58eafa-private.pem.key"
