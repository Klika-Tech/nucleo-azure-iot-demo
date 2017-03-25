/**
******************************************************************************
* @file    wifi_main.c
* @author  Central LAB
* @version V0.1.0
* @date    10-March-2016
* @brief   Wifi Main program body
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
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "stdio.h"
#include "string.h"
#include <math.h>
#include <time.h> 
#include <stdint.h>

/** @defgroup NUCLEO_WIFI_MODULE
* @{ Wi-Fi driver modules
*/


// Wifi SSID and Password 
uint8_t * ssid = "STM";
uint8_t * seckey = "STMdemoPWD";



/**
* Private typedef -----------------------------------------------------------
*/

typedef enum {
	wifi_state_reset = 0,
	wifi_state_ready,
	wifi_state_idle,
	wifi_state_connected,
	wifi_state_connecting,
	wifi_state_disconnected,
	wifi_state_time_socket,
	wifi_open_tls,
	wifi_send_json,
	wifi_state_socket,
	wifi_state_error,
	wifi_undefine_state       = 0xFF,  
} wifi_state_t;

/**
* Private define ------------------------------------------------------------
*/
#define APPLICATION_DEBUG_MSG 1


/**
* Private macro -------------------------------------------------------------
*/

/**
* Private function prototypes -----------------------------------------------
*/
uint8_t time_get_time_from_time_server();

void (*p_ind_wifi_socket_data_received)(uint8_t * data_ptr, uint32_t message_size, uint32_t chunck_size);
void (*p_ind_wifi_socket_client_remote_server_closed)(uint8_t * socket_closed_id);

void time_ind_wifi_socket_data_received(uint8_t * data_ptr, uint32_t message_size, uint32_t chunck_size);
void time_ind_wifi_socket_client_remote_server_closed(uint8_t * socket_closed_id);


/**
* Global Variables ---------------------------------------------------------
*/
static uint8_t TimeSocket;
static uint8_t TimeSocketClosed = 0;
int32_t last_ticks=0;
wifi_state_t wifi_state;
wifi_config config;
WiFi_Priv_Mode mode = WPA_Personal;
volatile uint32_t data_arrived_on_socket = 0;



/**
* Private functions ---------------------------------------------------------
*/




/**
* @brief  Wifi Main program
* @param  None
* @retval WiFi_Status_t value
*/
int wifi_main(void)
{    
	WiFi_Status_t status = WiFi_MODULE_SUCCESS;   
	uint32_t cnt=0;

	/* configure the timers  */
	Timer_Config( );

	printf("\r\nWiFi is initializing...\n\r");

	p_ind_wifi_socket_data_received = time_ind_wifi_socket_data_received;
	p_ind_wifi_socket_client_remote_server_closed = time_ind_wifi_socket_client_remote_server_closed;

	config.power=active;
	config.power_level=high;
	config.dhcp=on;
	config.web_server=WIFI_TRUE;

	wifi_state = wifi_state_idle;

	/* Init the wi-fi module */  
	status = wifi_init(&config);

	if(status!=WiFi_MODULE_SUCCESS)
	{
		printf("\r\rError in WIFI  Initialization\r\n");
		return status;
	}
	printf("\r\nWiFi is initialized.\r\n");

#if APPLICATION_DEBUG_MSG
	printf("\r\nconnecting to AP: %s\r\n", ssid);
#endif
	
	if((status = wifi_connect(ssid, seckey, mode))!= WiFi_MODULE_SUCCESS)
	{
		printf("\r\nError in AP Connection");
		return status;
	}
	
	/* wait here to be connected */
	while(wifi_state != wifi_state_connected)
	{
		HAL_Delay(500);
	}
	
	/* date/time in unix secs past 1-Jan-70 */
	while (time_get_time_from_time_server() != WiFi_MODULE_SUCCESS);
	
	printf("\r\nWait for NTP server Connection to be closed\r\n");

	__disable_irq();
	
	uint32_t temp = 0;
	
	while ((TimeSocketClosed == WIFI_FALSE)&& (temp++ < 50))
	{
		__enable_irq();
		
		printf(".");
		HAL_Delay(500);
		__disable_irq();
	}
	__enable_irq();
	
	if(TimeSocketClosed == WIFI_FALSE)
	{
		status = wifi_socket_client_close(TimeSocket);
		
		if(status!=WiFi_MODULE_SUCCESS)
		{
			printf("\r\rError in Closer of NTP Server Socket\r\n");
			return status;
		}
	}
	return status;
}
/**
* @brief Opens a socket to NTP server to read time
*
* 
* @param no parameter
* @return WiFi_Status_t value
*/
/*********************************************************************************//**
The Time Protocol may be implemented over the Transmission Control Protocol (TCP) or 
the User Datagram Protocol (UDP). A host connects to a server that supports the Time 
Protocol on port 37. The server then sends the time as a 32-bit unsigned integer in 
binary format and in network byte order, representing the number of seconds since 00:00 
(midnight) 1 January, 1900 GMT, and closes the connection. Operation over UDP requires 
the sending of any datagram to the server port, as there is no connection setup for UDP.

The fixed 32-bit data format means that the timestamp rolls over approximately every 136 years, 
with the first such occurrence on 7 February 2036. Programs that use the Time Protocol must be 
carefully designed to use context-dependent information to distinguish these dates from those in 1900.

********************************************************************************************/

char * ntp_server = "time-d.nist.gov";

uint8_t time_get_time_from_time_server()
{
	WiFi_Status_t status = WiFi_MODULE_SUCCESS;
	
	printf("\r\nConnecting to NTP server %s\r\n", ntp_server);
	
	//status = wifi_socket_client_open("time-d.nist.gov", 37, "t", &TimeSocket);
	status = wifi_socket_client_open(ntp_server, 37, "t", &TimeSocket);
	if(status == WiFi_MODULE_SUCCESS) {
#if APPLICATION_DEBUG_MSG   
		printf("\r\nNTP Server Connected\r\n");
#endif
		// Wait for NTP socket close callbacks
	}
	else
	{
		printf("\r\nNTP Server connection Error\r\n");
	}
	return status;

}


/**
****** WiFi Indication User Callback ********
*/

/**
* @brief Called asychronously by wifi driver when data arrives on wifi interface
*
* This function calls a function pointer to read data. According to socket requirement NTP read or AWS read is called
* @param unsigned pointer to char - pointer to data buffer to be read.
* @param signed int - total message data size to be received
* @param signed int - partial message data size received of total message size
* @return no return
*/

void ind_wifi_socket_data_received(uint8_t socket_id,uint8_t * data_ptr, uint32_t message_size, uint32_t chunck_size)
{
	(*p_ind_wifi_socket_data_received)(data_ptr,message_size,chunck_size);
}

/**
* @brief Called asychronously by wifi driver when client socket is closed by NTP server
*
* 
* @param unsigned pointer to char - pointer to socket id
*/
void ind_wifi_socket_client_remote_server_closed(uint8_t * socket_closed_id)
{
	(*p_ind_wifi_socket_client_remote_server_closed)(socket_closed_id);
}


/**
* @brief Called asychronously by wifi driver when wifi device is initialized
*
* 
* @param no parameter
* @return no return
*/

void ind_wifi_on() //WIFI ready
{
	/*Critical. Never change it*/
	wifi_state = wifi_state_ready; 
}


/**
* @brief Called asychronously by wifi driver when wifi device is connected to AP
*
* 
* @param no parameter
* @return no return
*/

void ind_wifi_connected() //connected to AP
{
	printf("\r\nwifi connected to AP: %s\r\n", ssid);
	wifi_state = wifi_state_connected;
}

/**
* @brief Called asychronously by wifi driver when wifi device resumes from suspend
*
* 
* @param no parameter
* @return no return
*/

void ind_wifi_resuming()
{
	printf("\r\nwifi resuming from sleep user callback... \r\n");
	//Change the state to connect to socket if not connected
	wifi_state = wifi_state_socket;
}

///
/////////////////////WiFi Indication User Callback for NTP server//////////////////////////////////////
///

/**
* @brief Called asychronously by wifi driver when data arrives on NTP Server socket
*
* 
* @param unsigned pointer to char - pointer to data buffer to be read.
* @param signed int - total message data size to be received
* @param signed int - partial message data size received of total message size
* @return no return
*/

void time_ind_wifi_socket_data_received(uint8_t * data_ptr, uint32_t message_size, uint32_t chunck_size)
{
#if APPLICATION_DEBUG_MSG
	printf("\r\nTime Received from NTP Server\r\n");
#endif
	///	
	/// Time Protocol provides the time as a binary number of seconds since 1900,
	/// 
	/// 2,208,988,800 corresponds to 00:00  1 Jan 1970 GMT from 12:00:01 am on 1 January 1900 GMT
	///
	last_ticks = ((data_ptr[0]<<24 )|(data_ptr[1]<<16)|(data_ptr[2]<<8)| data_ptr[3]) - 2208988800ul;	    
}

/**
* @brief Called asychronously by wifi driver when client socket is closed by NTP server
*
* 
* @param unsigned pointer to char - pointer to socket id
*/
void time_ind_wifi_socket_client_remote_server_closed(uint8_t * socket_closed_id)
{
	uint8_t id = *socket_closed_id;

	printf("\r\nNTP server socket closed\r\n");
	
	__disable_irq();

	TimeSocketClosed= WIFI_TRUE;
	
	__enable_irq();

	// Call here 
	wifi_state = wifi_state_idle;
}




///////////////////////////////////////////////////////////




#ifdef  USE_FULL_ASSERT

/**
* @brief  Reports the name of the source file and the source line number
*         where the assert_param error has occurred.
* @param  file: pointer to the source file name
* @param  line: assert_param error line source number
* @retval None
*/
void assert_failed(uint8_t* file, uint32_t line)
{ 
	/* User can add his own implementation to report the file name and line number,
	ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */

	/* Infinite loop */
	while (1)
	{
	}
}
#endif




/**
* @}
*/


/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
