package com.klikatech.nucleo;

import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;

import com.google.gson.JsonObject;
import com.path.android.jobqueue.JobManager;
import com.path.android.jobqueue.config.Configuration;
import com.path.android.jobqueue.log.CustomLogger;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class NucleoApplication extends Application {

    private static NucleoApplication applicationInst;
    private JobManager jobManager;
    private static Context mContext;
    public static boolean IS_DEBUG;

    public boolean isStart = false;
    public boolean isLine = false;

    private List<String> names;
    private List<String> selectedNames;


    private String endpoint_hostname;
    private String region;
    private String topic;

    public NucleoApplication() {
        super();
    }

    public static NucleoApplication getInstance() {
        return applicationInst;
    }


    @Override
    public void onCreate() {
        super.onCreate();

        IS_DEBUG = (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE));

        applicationInst = this;
        configureJobManager();
        mContext = getApplicationContext();

        try {
            JSONObject settings = (new JSONObject(loadSettingsJSONFromAsset())).getJSONObject("settings");

            endpoint_hostname = settings.getString("endpoint_hostname");
            region = settings.getString("region");
            topic = settings.getString("topic");

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public static Context getContext(){
        return mContext;
    }

    private void configureJobManager() {

        Configuration configuration = new Configuration.Builder(this)
                .customLogger(new CustomLogger() {
                    @Override
                    public boolean isDebugEnabled() {
                        return IS_DEBUG;
                    }

                    @Override
                    public void d(String text, Object... args) {}

                    @Override
                    public void e(Throwable t, String text, Object... args) {}

                    @Override
                    public void e(String text, Object... args) {}
                })
                .minConsumerCount(0)//always keep at least one consumer alive
                .maxConsumerCount(7)//up to 5 consumers at a time
                .loadFactor(2)//3 jobs per consumer
                .consumerKeepAlive(15)//wait 15 seconds
                .build();
        jobManager = new JobManager(this, configuration);
    }

    public JobManager getJobManager() {
        return jobManager;
    }

    public List<String> getNames(){
        return names;
    }

    public void setNames(List<String> names){
        this.names = names;
    }

    public void setSelectedCity(List<String> selected){

        this.selectedNames = selected;
    }

    public List<String> getSelectedCity(){

        return this.selectedNames;
    }

    private String loadSettingsJSONFromAsset() {

        String json = null;
        try {
            InputStream is = getAssets().open("settings.json");
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            json = new String(buffer, "UTF-8");
        } catch (IOException ex) {
            ex.printStackTrace();
            return null;
        }

        return json;
    }

    public String getEndPointHost(){
        return endpoint_hostname;
    }

    public String getRegion(){
        return region;
    }

    public String getTopic(){
        return topic;
    }
}

