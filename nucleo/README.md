# AWS IoT Sample App.
**This project generated for Keil uVision.**
## Files
*nucleo* - **base folder**
## Configuration
### Aws IoT configuration (aws_iot_config.h)

*Projects/Multi/Applications/MQTT_AWS/Inc/aws_iot_config.h* - **configuration for AWS connection**
```c
#define AWS_IOT_MQTT_HOST               "XXXXXXXXXXXXXX.iot.us-east-1.amazonaws.com"
#define AWS_IOT_MQTT_PORT               8883
#define AWS_IOT_MQTT_CLIENT_ID          "Nucleo"
#define AWS_IOT_MY_THING_NAME           "Nucleo"
```
Substitute the AWS_IOT_MQTT_HOST value with your AWS IoT endpoint (to find out the endpoint go to AWS IoT console and click small question mark on the right)

###### NOTE: In this application the settings below aren't used. See next section on how to configure certificates.
```c
#define AWS_IOT_ROOT_CA_FILENAME        "root-CA.crt"
#define AWS_IOT_CERTIFICATE_FILENAME    "132c58eafa-certificate.pem.crt"
#define AWS_IOT_PRIVATE_KEY_FILENAME    "132c58eafa-private.pem.key"
```
### Certificates (aws_nucleo_certificates.c)
*Aws_iot_sdks/aws_iot_src/protocol/mqtt/aws_iot_embedded_client_wrapper/platform_nucleo/aws_nucleo_certificates.c* - **place to store PEM certificates.**
#### Generating certificate
Generate a private key using a standard elliptic curve prime256v1 over a 256 bit prime field:
```bash
openssl ecparam -genkey -name prime256v1 -out nucleo.key.pem 
```
Next step is to make signing request (CSR). You will be prompted for additional information.
```bash
openssl req -new -sha256 -key nucleo.key.pem -out nucleo.csr
```

See [AWS setup guide](../aws/README.md) on how to sign and download the certificate.

Finally you have identity certificate *(somecode)-certificate.pem.crt* and private key *nucleo.key.pem* 
### Wi-Fi configuration (wifi_main.c)
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
