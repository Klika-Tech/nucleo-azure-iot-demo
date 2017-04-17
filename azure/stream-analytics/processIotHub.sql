SELECT
    iot.timestamp AS timestamp,
    iot.device_id AS device_id,
    iot.temperature AS temperature,
    iot.humidity AS humidity,
    iot.accelerometer AS accelerometer,
    iot.gyroscope AS gyroscope,
    iot.magnetometer AS magnetometer,
    iot.pressure AS pressure,
    iot.marker AS marker
INTO
    [database]
FROM
    [iot]
