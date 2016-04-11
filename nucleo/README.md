# AWS IoT Sample App.
###### _version 0.2_
## Files
*nucleo* - **base folder**
## Configuration
### Aws IoT config (aws_iot_config.h)

*Projects/Multi/Applications/MQTT_AWS/Inc/aws_iot_config.h* - **configuration for AWS connection**
```c
#define AWS_IOT_MQTT_HOST               "A1YBEPOVZYYAZ5.iot.us-east-1.amazonaws.com"
#define AWS_IOT_MQTT_PORT               8883
#define AWS_IOT_MQTT_CLIENT_ID          "Nucleo"
#define AWS_IOT_MY_THING_NAME           "Nucleo"
```

###### NOTE: In this application below settings produce no effect.
```c
#define AWS_IOT_ROOT_CA_FILENAME        "root-CA.crt"
#define AWS_IOT_CERTIFICATE_FILENAME    "132c58eafa-certificate.pem.crt"
#define AWS_IOT_PRIVATE_KEY_FILENAME    "132c58eafa-private.pem.key"
```
### Certificates (aws_nucleo_certificates.c)
*Aws_iot_sdks/aws_iot_src/protocol/mqtt/aws_iot_embedded_client_wrapper/platform_nucleo/aws_nucleo_certificates.c* - **place to store PEM certificates.**
###### NOTE: To generate credentials for Amazon see comments inside 
### Wi-Fi configurstion (wifi_main.c)
*Projects/Multi/Applications/MQTT_AWS/Src/wifi_main.c* - **Wi-Fi AP credentials**
```c
// Wifi SSID and Password 
char * ssid = "<WI_FI_AP>";
char * seckey = "<security_key>";
```
### MQTT communication (aws_main.c/.h)
*Projects/Multi/Applications/MQTT_AWS/Inc/aws_main.h*
*Projects/Multi/Applications/MQTT_AWS/Src/aws_main.c* - 
**AWS IoT subscription topic parameters and message defined here**