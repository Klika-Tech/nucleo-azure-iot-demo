/**
 ******************************************************************************
 * @file    aws_nucleo_certificates.c
 * @author  Central LAB
 * @version V0.1.0
 * @date    10-March-2016
 * @brief   AWS IoT Device Certificates, Private Key file
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


#include "stdint.h"


/**********************************************************************************************
***********************************************************************************************
													Root CA certificate: Never modify
***********************************************************************************************
***********************************************************************************************/

/************************************************************************
Downloaded from https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem
*************************************************************************/
//This root CA can be used.
uint8_t rootCA[] = "\
-----BEGIN CERTIFICATE-----\n\
MIIE0zCCA7ugAwIBAgIQGNrRniZ96LtKIVjNzGs7SjANBgkqhkiG9w0BAQUFADCBy\
jELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMR8wHQYDVQQLEx\
ZWZXJpU2lnbiBUcnVzdCBOZXR3b3JrMTowOAYDVQQLEzEoYykgMjAwNiBWZXJpU2l\
nbiwgSW5jLiAtIEZvciBhdXRob3JpemVkIHVzZSBvbmx5MUUwQwYDVQQDEzxWZXJp\
U2lnbiBDbGFzcyAzIFB1YmxpYyBQcmltYXJ5IENlcnRpZmljYXRpb24gQXV0aG9ya\
XR5IC0gRzUwHhcNMDYxMTA4MDAwMDAwWhcNMzYwNzE2MjM1OTU5WjCByjELMAkGA1\
UEBhMCVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMR8wHQYDVQQLExZWZXJpU2l\
nbiBUcnVzdCBOZXR3b3JrMTowOAYDVQQLEzEoYykgMjAwNiBWZXJpU2lnbiwgSW5j\
LiAtIEZvciBhdXRob3JpemVkIHVzZSBvbmx5MUUwQwYDVQQDEzxWZXJpU2lnbiBDb\
GFzcyAzIFB1YmxpYyBQcmltYXJ5IENlcnRpZmljYXRpb24gQXV0aG9yaXR5IC0gRz\
UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCvJAgIKXo1nmAMqudLO07\
cfLw8RRy7K+D+KQL5VwijZIUVJ/XxrcgxiV0i6CqqpkKzj/i5Vbext0uz/o9+B1fs\
70PbZmIVYc9gDaTY3vjgw2IIPVQT60nKWVSFJuUrjxuf6/WhkcIzSdhDY2pSS9KP6\
HBRTdGJaXvHcPaz3BJ023tdS1bTlr8Vd6Gw9KIl8q8ckmcY5fQGBO+QueQA5N06tR\
n/Arr0PO7gi+s3i+z016zy9vA9r911kTMZHRxAy3QkGSGT2RT+rCpSx4/VBEnkjWN\
HiDxpg8v+R70rfk/Fla4OndTRQ8Bnc+MUCH7lP59zuDMKz10/NIeWiu5T6CUVAgMB\
AAGjgbIwga8wDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwbQYIKwYBB\
QUHAQwEYTBfoV2gWzBZMFcwVRYJaW1hZ2UvZ2lmMCEwHzAHBgUrDgMCGgQUj+XTGo\
asjY5rw8+AatRIGCx7GS4wJRYjaHR0cDovL2xvZ28udmVyaXNpZ24uY29tL3ZzbG9\
nby5naWYwHQYDVR0OBBYEFH/TZafC3ey78DAJ80M5+gKvMzEzMA0GCSqGSIb3DQEB\
BQUAA4IBAQCTJEowX2LP2BqYLz3q3JktvXf2pXkiOOzEp6B4Eq1iDkVwZMXnl2Ytm\
Al+X6/WzChl8gGqCBpH3vn5fJJaCGkgDdk+bW48DW7Y5gaRQBi5+MHt39tBquCWIM\
nNZBU4gcmU7qKEKQsTb47bDN0lAtukixlE0kF6BWlKWE9gyn6CagsCqiUXObXbf+e\
EZSqVir2G3l6BFoMtEMze/aiCKm0oHw0LxOXnGiYZ4fQRbxC1lfznQgUy286dUV4o\
tp6F01vvpX1FQHKOtw5rDgb7MzVIcbidJ4vEZV8NhnacRHr2lVz2XTIIM6RUthg/a\
FzyQkqFOFSDX9HoLPKsEdao7WNq\
\n-----END CERTIFICATE-----\n";

/**********************************************************************************************
***********************************************************************************************
													Device Identity Certificates: Modify for your AWS IoT Thing
***********************************************************************************************
***********************************************************************************************/

/****************************************
(somecode)-certificate.pem.crt - Amazon signed PEM sertificate.
*****************************************/

//This Client cert is example. Use own instead.
uint8_t clientCRT[] = "\
-----BEGIN CERTIFICATE-----\n\
MIICtjCCAZ6gAwIBAgIVAINKgHvS+hgoo9IQ8xu7xdDcRoTfMA0GCSqGSIb3DQEB\
CwUAME0xSzBJBgNVBAsMQkFtYXpvbiBXZWIgU2VydmljZXMgTz1BbWF6b24uY29t\
IEluYy4gTD1TZWF0dGxlIFNUPVdhc2hpbmd0b24gQz1VUzAeFw0xNjA2MDgxMTUx\
NTJaFw00OTEyMzEyMzU5NTlaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21l\
LVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwWTATBgcq\
hkjOPQIBBggqhkjOPQMBBwNCAARUAkuTJ3E2Ka3eKNMmTQm4geuzPlnwj4nfMQV0\
m5ZumMLY8YTv7ylIEmgIGGJT6Z/WsFYSM9k9AB6P61VVneIwo2AwXjAfBgNVHSME\
GDAWgBT9+uFfyvhEYs8U1jTljtBQLc15+TAdBgNVHQ4EFgQUX8tH2AQL2zbgEBw8\
qMDkcbgPxi4wDAYDVR0TAQH/BAIwADAOBgNVHQ8BAf8EBAMCB4AwDQYJKoZIhvcN\
AQELBQADggEBAAzE/X7Gp7dgR0TwVfVtTacdm2z3apBAe2CUtQjUglXNkwW73wQm\
EDpFXEPHb2qu2GcnWLGre4OtRp0xrGfRdWuelk6QpHqPkbaIYtZtA4rg9dGjMEv0\
dtjTv3p//eOYWjTeW0czLG5Fj2MgDcOm1Q11Dji8ThgdnuJ1ouWa6ysM55tKSebv\
/KBBMzhgdCKxzS1U32dekvhU0Kg02LTBlO8NJ6WZ8x7444RU45hwE7wTkqX5Mk8L\
+AQUk6UyKrhyWH6/THbDLoJKiLn8Z0dG//7xk1aS5PXIDkn6c578gMieXPK91qrw\
nNmJLq5lvfriHKgUYgG7HsQI/XdoS6/0X0s=\
\n-----END CERTIFICATE-----\n";


/**********************************************************************************************
***********************************************************************************************
													Private Key: Modify for your AWS IoT Thing
***********************************************************************************************
***********************************************************************************************/


/********************************************************************8****************************************
nucleo.key.pem - client key generated according to readme.
**************************************************************************************************************/

//This Client Key is example. Use own instead.
uint8_t clientKey[] ="\
-----BEGIN EC PARAMETERS-----\n\
BggqhkjOPQMBBw==\
-----END EC PARAMETERS-----\n\
-----BEGIN EC PRIVATE KEY-----\n\
MHcCAQEEIPrtE2cCZURyr3Ud5jzSe1L1gGAqtLvBMfGYtgepGXmxoAoGCCqGSM49\
AwEHoUQDQgAEVAJLkydxNimt3ijTJk0JuIHrsz5Z8I+J3zEFdJuWbpjC2PGE7+8p\
SBJoCBhiU+mf1rBWEjPZPQAej+tVVZ3iMA==\n\
-----END EC PRIVATE KEY-----\n";
