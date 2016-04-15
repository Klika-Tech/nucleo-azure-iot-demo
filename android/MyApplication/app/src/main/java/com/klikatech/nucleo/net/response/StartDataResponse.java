package com.klikatech.nucleo.net.response;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

public class StartDataResponse {

    @Expose
    @SerializedName("sensorData")
    public List<sensorData> sensorData;

    @Expose
    @SerializedName("weatherData")
    public List<weatherData> weatherData;

    public class sensorData{

        @Expose
        @SerializedName("temperature")
        public float temperature;

        @Expose
        @SerializedName("timestamp")
        public long timestamp;
    }

    public class weatherData{

        @Expose
        @SerializedName("cityName")
        public String cityName;

        @Expose
        @SerializedName("cityId")
        public String cityId;

        @Expose
        @SerializedName("tempData")
        public List<tempData> tempData;

    }

    public class tempData{

        @Expose
        @SerializedName("temperature")
        public float temperature;

        @Expose
        @SerializedName("timestamp")
        public long timestamp;

    }
}
