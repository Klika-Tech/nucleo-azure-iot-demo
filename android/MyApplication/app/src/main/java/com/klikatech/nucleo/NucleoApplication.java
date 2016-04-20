package com.klikatech.nucleo;

import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;

import com.path.android.jobqueue.JobManager;
import com.path.android.jobqueue.config.Configuration;
import com.path.android.jobqueue.log.CustomLogger;

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
}

