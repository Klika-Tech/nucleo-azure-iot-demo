# Nucleo Board Demo Android Apps

## Build Instructions

1. Download [Android Studio](https://developer.android.com/studio/index.html) v2.0 or above and Android SDK >=15 
1. Import project
1. Go to `app/src/main/assets` and rename the settings template file `settings.dist.json` to `settings.json`
1. Open the settings file and substitute all placeholders in setting values with your AWS account details. See [AWS Setup Guide](../aws/README.md) for details
  - "endpoint_hostname" is the API Gateway endpoint
  - "customer_specific_endpoint_prefix" is the IoT endpoint prefix. (i.e. "A3YBFPOVDYYAZ5")
1. Build and Start the application


