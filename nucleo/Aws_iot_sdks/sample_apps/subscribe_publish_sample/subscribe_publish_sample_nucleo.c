/*
* Copyright 2010-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License").
* You may not use this file except in compliance with the License.
* A copy of the License is located at
*
*  http://aws.amazon.com/apache2.0
*
* or in the "license" file accompanying this file. This file is distributed
* on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied. See the License for the specific language governing
* permissions and limitations under the License.
*/

/**
* @file subscribe_publish_sample.c
* @brief simple MQTT publish and subscribe on the same topic
*
* This example takes the parameters from the aws_iot_config.h file and establishes a connection to the AWS IoT MQTT Platform.
* It subscribes and publishes to the same topic - "sdkTest/sub"
*
* If all the certs are correct, you should see the messages received by the application in a loop.
*
* The application takes in the certificate path, host name , port and the number of times the publish should happen.
*
*/

/*******************************************************************************
* @file    subscribe_publish_sample_nucleo.c
* @author  Central LAB
* @version V0.1.0
* @date    10-March-2016
* @brief   simple MQTT publish and subscribe implementation for sample on Nucleo.
******************************************************************************
* @attention
*
* <h2><center>&copy; COPYRIGHT(c) 2015 STMicroelectronics</center></h2>
*
* Redistribution and use in source and binary forms, with or without modification,
* are permitted provided that the following conditions are met:
*   1. Redistributions of source code must retain the above copyright notice,
*      this list of conditions and the following disclaimer.
*   2. Redistributions in binary form must reproduce the above copyright notice,
*      this list of conditions and the following disclaimer in the documentation
*      and/or other materials provided with the distribution.
*   3. Neither the name of STMicroelectronics nor the names of its contributors
*      may be used to endorse or promote products derived from this software
*      without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
******************************************************************************
*/


//#include "stdio.h"
//#include "stdlib.h"
#include "ctype.h"
#include "string.h"
//#include <unistd.h>

//#include <signal.h>
//#include <memory.h>
//#include <sys/time.h>
//#include <limits.h>
#include "timer_interface.h"

#include "aws_iot_log.h"
#include "aws_iot_version.h"
#include "aws_iot_mqtt_interface.h"
#include "aws_iot_config.h"
#include "x_nucleo_iks01a1_hum_temp.h"


#define PATH_MAX 800
char *optarg;
int optind, opterr, optopt;

extern char rootCA[];
extern char clientCRT[];
extern char clientKey[];
//extern uint8_t * rootCA;
//extern uint8_t * clientCRT;
//extern uint8_t * clientKey;
extern volatile uint32_t BpushButtonState;

//int getopt(int argc, char** argv, const char *optstring) {return 0;}
//char* getcwd( char* buffer, size_t size ) {return 0;}


/**
* @brief Default cert location
*/
//char certDirectory[PATH_MAX + 1] = "../../certs";

/**
* @brief Default MQTT HOST URL is pulled from the aws_iot_config.h
*/
char HostAddress[255] = AWS_IOT_MQTT_HOST;

/**
* @brief Default MQTT port is pulled from the aws_iot_config.h
*/
uint32_t port = AWS_IOT_MQTT_PORT;

/**
* @brief This parameter will avoid infinite loop of publish and exit the program after certain number of publishes
*/
uint32_t publishCount = 0;
float TEMPERATURE_Value;
int32_t d1 = 0, d2 = 0;


//	char CurrentWD[PATH_MAX + 1];
char cafileName[] = AWS_IOT_ROOT_CA_FILENAME;
char clientCRTName[] = AWS_IOT_CERTIFICATE_FILENAME;
char clientKeyName[] = AWS_IOT_PRIVATE_KEY_FILENAME;


/**
* @brief MQTT subscriber callback hander
*
* called when data is received from AWS IoT Thing (message broker)
* @param MQTTCallbackParams type parameter
* @return no return
*/
int MQTTcallbackHandler(MQTTCallbackParams params) {

	INFO("Subscribe callback");
	INFO("%.*s\t%.*s",
	(int)params.TopicNameLen, params.pTopicName,
	(int)params.MessageParams.PayloadLen, (char*)params.MessageParams.pPayload);

	return 0;
}

/**
* @brief MQTT disconnect callback hander
*
* @param no parameter
* @return no return
*/

void disconnectCallbackHandler(void) {
	WARN("MQTT Disconnect");
}

/**
* @brief main entry function to AWS IoT code
*
* @param no parameter
* @return IoT_Error_t status return
*/

int aws_main() {
	
	IoT_Error_t rc = NONE_ERROR;
	int32_t i = 0;
	bool infinitePublishFlag = true;


	INFO("\nAWS IoT SDK Version %d.%d.%d-%s\n", VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH, VERSION_TAG);


	//	getcwd(CurrentWD, sizeof(CurrentWD));
	//	sprintf(rootCA, "%s/%s/%s", CurrentWD, certDirectory, cafileName);
	//	sprintf(clientCRT, "%s/%s/%s", CurrentWD, certDirectory, clientCRTName);
	//	sprintf(clientKey, "%s/%s/%s", CurrentWD, certDirectory, clientKeyName);



	//	DEBUG("rootCA %s", rootCA);
	//	DEBUG("clientCRT %s", clientCRT);
	//	DEBUG("clientKey %s", clientKey);

	MQTTConnectParams connectParams = MQTTConnectParamsDefault;

	connectParams.KeepAliveInterval_sec = 30;
	connectParams.isCleansession = true;
	connectParams.MQTTVersion = MQTT_3_1_1;
	connectParams.pClientID = AWS_IOT_MQTT_CLIENT_ID;//"CSDK-test-device";
	connectParams.pHostURL = HostAddress;						 //Assign a Host Name
	connectParams.port = port;											 //8883
	connectParams.isWillMsgPresent = false;
	connectParams.pRootCALocation = rootCA;
	connectParams.pDeviceCertLocation = clientCRT;
	connectParams.pDevicePrivateKeyLocation = clientKey;
	connectParams.mqttCommandTimeout_ms = 15000;//2000 //ST
	connectParams.tlsHandshakeTimeout_ms = 15000;//5000; //ST
	//connectParams.isSSLHostnameVerify = true;// ensure this is set to true for production
	connectParams.isSSLHostnameVerify = false;// ensure this is set to true for production 
	connectParams.disconnectHandler = disconnectCallbackHandler;

	INFO("Connecting AWS IoT...");
	rc = aws_iot_mqtt_connect(&connectParams);
	if (NONE_ERROR != rc) {
		ERROR("Error(%d) connecting to %s:%d", rc, connectParams.pHostURL, connectParams.port);
	}
	else
	{
		DEBUG("aws_iot_mqtt_connect: connected to %s:%d", connectParams.pHostURL, connectParams.port);
	}

	MQTTSubscribeParams subParams = MQTTSubscribeParamsDefault;
	subParams.mHandler = MQTTcallbackHandler;
	subParams.pTopic = "Nucleo/test";
	subParams.qos = QOS_0;

	if (NONE_ERROR == rc) {
		INFO("Subscribing to AWS IoT...");
		rc = aws_iot_mqtt_subscribe(&subParams);
		if (NONE_ERROR != rc) {
			ERROR("Error subscribing");
		}
		else
		{
			DEBUG("aws_iot_mqtt_subscribe PASS");
		}
	}

	MQTTMessageParams Msg = MQTTMessageParamsDefault;
	Msg.qos = QOS_0;
	char cPayload[100];
	sprintf(cPayload, "%s : %d ", "hello from STM", i);
	Msg.pPayload = (void *) cPayload;


	MQTTPublishParams Params = MQTTPublishParamsDefault;
	//Params.pTopic = "Nucleo/shadow/update";


	if(publishCount != 0){
		infinitePublishFlag = false;
	}

	while (NONE_ERROR == rc && (publishCount > 0 || infinitePublishFlag)) {

		//Max time the yield function will wait for read messages
		rc = aws_iot_mqtt_yield(2000); //100
		DEBUG("-->sleep");
		fsleep(100);
		
		if(BpushButtonState)
		{
			BpushButtonState = 0;
			
			if(BSP_HUM_TEMP_GetTemperature((float *)&TEMPERATURE_Value) != HUM_TEMP_OK)
			ERROR("Temperature reading error\r\n");
			
			Params.pTopic = "Nucleo/data";
			
			sprintf(cPayload, "{\"temperature\": %f, \"marker\": true}", TEMPERATURE_Value);
			Msg.PayloadLen = strlen(cPayload);
			Params.MessageParams = Msg;
			
			INFO("Button pressed - Publishing Temperature:%f", TEMPERATURE_Value);
			rc = aws_iot_mqtt_publish(&Params);
						
			if(publishCount > 0){
				publishCount--;
			}
		}
		else
		{
			fsleep(4900);
			if(BSP_HUM_TEMP_GetTemperature((float *)&TEMPERATURE_Value) != HUM_TEMP_OK)
			ERROR("Temperature reading error\r\n");
			
			Params.pTopic = "$aws/things/Nucleo/shadow/update";
			
			sprintf(cPayload, "{\"state\": {\"reported\": {\"temperature\": %f}}}", TEMPERATURE_Value);
			Msg.PayloadLen = strlen(cPayload);
			Params.MessageParams = Msg;
			
			INFO("___________Publishing Temperature:%f", TEMPERATURE_Value);
			rc = aws_iot_mqtt_publish(&Params);
		}
				
	}

	if(NONE_ERROR != rc){
		ERROR("An error occurred in the loop.\n");
	}
	else{
		INFO("Publish done");
	}
	/* Error or No Error, disconnect from MQTT server*/
	aws_iot_mqtt_disconnect();
	
	return rc;
}



