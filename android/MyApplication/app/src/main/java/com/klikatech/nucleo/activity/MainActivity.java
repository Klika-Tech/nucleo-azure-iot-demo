package com.klikatech.nucleo.activity;

import android.app.Activity;
import android.app.Dialog;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;

import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.amazonaws.auth.AWSSessionCredentials;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.iot.AWSIotKeystoreHelper;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttClientStatusCallback;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttLastWillAndTestament;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttManager;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttNewMessageCallback;
import com.amazonaws.mobileconnectors.iot.AWSIotMqttQos;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.iot.AWSIotClient;
import com.amazonaws.services.iot.model.AttachPrincipalPolicyRequest;
import com.amazonaws.services.iot.model.CreateKeysAndCertificateRequest;
import com.amazonaws.services.iot.model.CreateKeysAndCertificateResult;
import com.github.mikephil.charting.animation.Easing;
import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.LimitLine;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.highlight.Highlight;
import com.github.mikephil.charting.interfaces.datasets.ILineDataSet;
import com.github.mikephil.charting.listener.ChartTouchListener;
import com.github.mikephil.charting.listener.OnChartGestureListener;
import com.github.mikephil.charting.listener.OnChartValueSelectedListener;
import com.klikatech.nucleo.NucleoApplication;
import com.klikatech.nucleo.R;
import com.klikatech.nucleo.custom.MyMarkerView;
import com.klikatech.nucleo.custom.XAxisValueFormat;
import com.klikatech.nucleo.event.StartDataEvent;
import com.klikatech.nucleo.job.StartDataJob;

import com.klikatech.nucleo.net.response.StartDataResponse;
import com.path.android.jobqueue.JobManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import de.greenrobot.event.EventBus;

import static com.klikatech.nucleo.net.response.StartDataResponse.*;

public class MainActivity extends AppCompatActivity implements OnChartGestureListener, OnChartValueSelectedListener {

    public final String LOG_TAG = "NUCLEO_TAG";

    private static final String CUSTOMER_SPECIFIC_ENDPOINT_PREFIX = "A1YBEPOVZYYAZ5";
    private static final String COGNITO_POOL_ID = "us-east-1:094c9684-1d40-449f-8305-b4ad3d6e5ff4";
    private static final String AWS_IOT_POLICY_NAME = "Nucleo-Policy";
    private static final Regions MY_REGION = Regions.US_EAST_1;
    private static final String KEYSTORE_NAME = "iot_keystore";
    private static final String KEYSTORE_PASSWORD = "password";
    private static final String CERTIFICATE_ID = "default";

    AWSIotClient mIotAndroidClient;
    AWSIotMqttManager mqttManager;
    String clientId;
    String keystorePath;
    String keystoreName;
    String keystorePassword;

    KeyStore clientKeyStore = null;
    String certificateId;

    CognitoCachingCredentialsProvider credentialsProvider;

    ProgressBar pb;

    JobManager jobManager = NucleoApplication.getInstance().getJobManager();
    List<String> nameCity;

    private StartDataResponse mStartDataResponse;

    private LineChart mChart;
    CustomDialogClass cdd;
    private boolean isStartChartAnimation = false;

    Thread threadUpdate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.activity_main);

        if (!NucleoApplication.getInstance().isStart) {
            cdd = new CustomDialogClass(MainActivity.this);
            cdd.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
            cdd.show();
            NucleoApplication.getInstance().isStart = true;
        } else {

            long time = System.currentTimeMillis() - 86400000;
            StartDataJob startDataJob = new StartDataJob(String.valueOf(time / 1000));
            jobManager.addJob(startDataJob);
        }

        findViewById(R.id.b_settings).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent i = new Intent(MainActivity.this, SettingActivity.class);
                startActivity(i);
            }
        });


        pb = (ProgressBar) findViewById(R.id.progressBar);

        if (threadUpdate != null) {
            threadUpdate.interrupt();
            threadUpdate = null;
        }


        threadUpdate = new Thread(new Runnable() {
            @Override
            public void run() {

                synchronized (threadUpdate) {
                    try {
                        threadUpdate.wait(11000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

                long time = System.currentTimeMillis() - 86400000;
                StartDataJob startDataJob = new StartDataJob(String.valueOf(time / 1000));
                jobManager.addJob(startDataJob);
            }
        });

        threadUpdate.start();

        startClient();
    }

    private void setCity() {

        List<String> s = NucleoApplication.getInstance().getSelectedCity();

        TextView tcity2 = (TextView) findViewById(R.id.tv_city2);
        TextView tcity3 = (TextView) findViewById(R.id.tv_city3);
        TextView tcity4 = (TextView) findViewById(R.id.tv_city4);
        TextView tcity5 = (TextView) findViewById(R.id.tv_city5);
        TextView tcity6 = (TextView) findViewById(R.id.tv_city6);

        if (s != null && s.size() > 0) {
            if (s.size() < 3) {
                findViewById(R.id.l_city2).setVisibility(View.GONE);

                if (s.size() == 1) {
                    tcity2.setVisibility(View.VISIBLE);
                    tcity3.setVisibility(View.GONE);

                    tcity2.setText(s.get(0));

                } else {
                    tcity2.setVisibility(View.VISIBLE);
                    tcity3.setVisibility(View.VISIBLE);

                    tcity2.setText(s.get(0));
                    tcity3.setText(s.get(1));
                }


            } else {
                findViewById(R.id.l_city2).setVisibility(View.VISIBLE);

                tcity2.setVisibility(View.VISIBLE);
                tcity3.setVisibility(View.VISIBLE);

                tcity2.setText(s.get(0));
                tcity3.setText(s.get(1));

                if (s.size() == 3) {

                    tcity4.setVisibility(View.VISIBLE);
                    tcity5.setVisibility(View.GONE);
                    tcity6.setVisibility(View.GONE);

                    tcity4.setText(s.get(2));
                }

                if (s.size() == 4) {

                    tcity4.setVisibility(View.VISIBLE);
                    tcity5.setVisibility(View.VISIBLE);
                    tcity6.setVisibility(View.GONE);

                    tcity4.setText(s.get(2));
                    tcity5.setText(s.get(3));
                }

                if (s.size() == 5) {

                    tcity4.setVisibility(View.VISIBLE);
                    tcity5.setVisibility(View.VISIBLE);
                    tcity6.setVisibility(View.VISIBLE);

                    tcity4.setText(s.get(2));
                    tcity5.setText(s.get(3));
                    tcity6.setText(s.get(4));
                }
            }
        }
    }

    private void setChart(StartDataResponse startDataResponse) {

        mChart = (LineChart) findViewById(R.id.chart1);
        mChart.setOnChartGestureListener(this);
        mChart.setOnChartValueSelectedListener(this);
        mChart.setDrawGridBackground(false);

        // no description text
        mChart.setDescription("");
        mChart.setNoDataTextDescription("You need to provide data for the chart.");

        // enable touch gestures
        mChart.setTouchEnabled(true);

        // enable scaling and dragging
        mChart.setDragEnabled(true);
        mChart.setScaleEnabled(true);
        // mChart.setScaleXEnabled(true);
        // mChart.setScaleYEnabled(true);

        // if disabled, scaling can be done on x- and y-axis separately
        mChart.setPinchZoom(true);

        // set an alternative background color
        mChart.setBackgroundColor(Color.TRANSPARENT);


        // x-axis limit line
        LimitLine llXAxis = new LimitLine(10f, "Index 10");
        llXAxis.setLineWidth(0f);
        llXAxis.enableDashedLine(10f, 10f, 0f);
        llXAxis.setLabelPosition(LimitLine.LimitLabelPosition.RIGHT_BOTTOM);
        llXAxis.setTextSize(10f);

        Typeface tf = Typeface.createFromAsset(getAssets(), "OpenSans-Regular.ttf");

        mChart.getAxisLeft().setPosition(YAxis.YAxisLabelPosition.INSIDE_CHART);
        mChart.getXAxis().setPosition(XAxis.XAxisPosition.BOTTOM);

        mChart.getAxisLeft().setTypeface(tf);
        mChart.getXAxis().setTypeface(tf);

        XAxis xAxis = mChart.getXAxis();
        xAxis.setDrawGridLines(false);
        xAxis.setDrawAxisLine(false);

        //xAxis.setValueFormatter(new MyCustomXAxisValueFormatter());
        //xAxis.addLimitLine(llXAxis); // add x-axis limit line


        YAxis leftAxis = mChart.getAxisLeft();
        leftAxis.removeAllLimitLines(); // reset all limit lines to avoid overlapping lines
        //leftAxis.setTypeface(tf);

        leftAxis.setAxisMaxValue(50f);
        leftAxis.setAxisMinValue(-0f);
        //leftAxis.setYOffset(20f);
        leftAxis.enableGridDashedLine(10f, 10f, 0f);
        leftAxis.setDrawZeroLine(false);
        leftAxis.setDrawAxisLine(false);
        leftAxis.setDrawGridLines(false);
        // limit lines are drawn behind data (and not on top)
        leftAxis.setDrawLimitLinesBehindData(true);

        mChart.getAxisRight().setEnabled(false);

        //mChart.getViewPortHandler().setMaximumScaleY(2f);
        //mChart.getViewPortHandler().setMaximumScaleX(2f);

        // add data
        mChart.getXAxis().setPosition(XAxis.XAxisPosition.BOTTOM);
        mChart.getXAxis().setValueFormatter(new XAxisValueFormat());

        if (!isStartChartAnimation) {
            setData(startDataResponse, true);
            isStartChartAnimation = true;
        } else
            setData(startDataResponse, false);

        // create a custom MarkerView (extend MarkerView) and specify the layout
        // to use for it
        MyMarkerView mv = new MyMarkerView(this, R.layout.custom_marker_view, startDataResponse);

        // set the marker to the chart
        mChart.setMarkerView(mv);

        mChart.animateX(2500, Easing.EasingOption.EaseInOutQuart);
        mChart.invalidate();


    }

    private void setData(StartDataResponse startDataResponse, boolean isZoom) {

        if (startDataResponse.sensorData != null && startDataResponse.sensorData.size() != 0) {
            ArrayList<String> xVals = new ArrayList<String>();
            for (int i = 0; i < startDataResponse.sensorData.size(); i++) {
                xVals.add(startDataResponse.sensorData.get(i).timestamp + "");
            }
            ArrayList<ILineDataSet> dataSets = new ArrayList<ILineDataSet>();

            //sensor data
            ArrayList<Entry> yVals = new ArrayList<Entry>();

            for (int i = 0; i < startDataResponse.sensorData.size(); i++) {
                yVals.add(new Entry(startDataResponse.sensorData.get(i).temperature, i));
            }

            LineDataSet set1;

            set1 = new LineDataSet(yVals, null);
            set1.setColor(getResources().getColor(R.color.bg_city1));
            set1.setLineWidth(1f);
            set1.setDrawCircles(false);
            set1.setDrawCircleHole(false);
            set1.setValueTextSize(9f);
            set1.setDrawFilled(!NucleoApplication.getInstance().isLine);
            dataSets.add(set1);

            if (NucleoApplication.getInstance().getSelectedCity() != null && NucleoApplication.getInstance().getSelectedCity().size() != 0) {
                List<Integer> colors = getCityColors();

                if (startDataResponse.weatherData != null && startDataResponse.weatherData.size() != 0) {

                    for (int i = 0; i < startDataResponse.weatherData.size(); i++) {

                        if (NucleoApplication.getInstance().getSelectedCity().contains(startDataResponse.weatherData.get(i).cityName)) {

                            StartDataResponse.weatherData weatherData = startDataResponse.weatherData.get(i);

                            if (weatherData.tempData.size() > 0) {
                                ArrayList<Entry> yValsTemp = new ArrayList<Entry>();
                                yValsTemp.clear();
                                for (int j = 0; j < weatherData.tempData.size(); j++) {

                                    int k = Math.round(xVals.size() * (weatherData.tempData.get(j).timestamp - startDataResponse.sensorData.get(0).timestamp) /
                                            (startDataResponse.sensorData.get(startDataResponse.sensorData.size() - 1).timestamp - startDataResponse.sensorData.get(0).timestamp));


                                    if (k <= xVals.size() - 1)
                                        yValsTemp.add(new Entry(weatherData.tempData.get(j).temperature, k));
                                }

                                LineDataSet set;
                                set = new LineDataSet(yValsTemp, null);

                                if (i < 7)
                                    set.setColor(colors.get(i));
                                else
                                    set.setColor(colors.get(7));

                                set.setLineWidth(1f);
                                set.setDrawCircleHole(false);
                                set.setDrawCircles(false);
                                set.setValueTextSize(9f);
                                set.setDrawFilled(false);
                                dataSets.add(set);
                            }
                        }
                    }
                }
            }

            LineData data = new LineData(xVals, dataSets);

            // set data
            mChart.setData(data);
            mChart.notifyDataSetChanged();
            mChart.invalidate();

            if (isZoom) {
                //mChart.zoom(20f,20f,10000,0, YAxis.AxisDependency.RIGHT);
                //mChart.moveViewToY(yVals.get(yVals.size()-1).getVal(), YAxis.AxisDependency.RIGHT);

                mChart.zoomAndCenterAnimated(24f, 24f, xVals.size() - 1, yVals.get(yVals.size() - 1).getVal(), YAxis.AxisDependency.LEFT, 3000);
            }
            //mChart.moveViewTo(data.getXValCount(),data.getYValCount(),);
        }
    }

    private List<Integer> getCityColors() {
        List<Integer> colors = new ArrayList<>();
        for (int i = 2; i <= 9; i++) {
            switch (i) {
                case 2:
                    colors.add(getResources().getColor(R.color.bg_city2));
                    break;
                case 3:
                    colors.add(getResources().getColor(R.color.bg_city3));
                    break;
                case 4:
                    colors.add(getResources().getColor(R.color.bg_city4));
                    break;
                case 5:
                    colors.add(getResources().getColor(R.color.bg_city5));
                    break;
                case 6:
                    colors.add(getResources().getColor(R.color.bg_city6));
                    break;
                case 7:
                    colors.add(getResources().getColor(R.color.bg_city7));
                    break;
                case 8:
                    colors.add(getResources().getColor(R.color.bg_city8));
                    break;
                case 9:
                    colors.add(getResources().getColor(R.color.bg_city9));
                    break;
            }
        }
        return colors;
    }

    private void startClient() {

        clientId = UUID.randomUUID().toString();

        credentialsProvider = new CognitoCachingCredentialsProvider(
                getApplicationContext(), // context
                COGNITO_POOL_ID, // Identity Pool ID
                MY_REGION // Region
        );

        Region region = Region.getRegion(MY_REGION);

        mqttManager = new AWSIotMqttManager(clientId, region, CUSTOMER_SPECIFIC_ENDPOINT_PREFIX);

        mqttManager.setKeepAlive(10);

        AWSIotMqttLastWillAndTestament lwt = new AWSIotMqttLastWillAndTestament("mqtt",
                "Android client lost connection", AWSIotMqttQos.QOS0);
        mqttManager.setMqttLastWillAndTestament(lwt);

        mIotAndroidClient = new AWSIotClient(credentialsProvider);
        mIotAndroidClient.setRegion(region);

        keystorePath = getFilesDir().getPath();
        keystoreName = KEYSTORE_NAME;
        keystorePassword = KEYSTORE_PASSWORD;
        certificateId = CERTIFICATE_ID;

        try {
            if (AWSIotKeystoreHelper.isKeystorePresent(keystorePath, keystoreName)) {
                if (AWSIotKeystoreHelper.keystoreContainsAlias(certificateId, keystorePath,
                        keystoreName, keystorePassword)) {
                    Log.i(LOG_TAG, "Certificate " + certificateId
                            + " found in keystore - using for MQTT.");

                    clientKeyStore = AWSIotKeystoreHelper.getIotKeystore(certificateId,
                            keystorePath, keystoreName, keystorePassword);

                    //Enable connect
                    connectClient();

                } else {
                    Log.i(LOG_TAG, "Key/cert " + certificateId + " not found in keystore.");
                }
            } else {
                Log.i(LOG_TAG, "Keystore " + keystorePath + "/" + keystoreName + " not found.");
            }
        } catch (Exception e) {
            Log.e(LOG_TAG, "An error occurred retrieving cert/key from keystore.", e);
        }

        if (clientKeyStore == null) {
            Log.i(LOG_TAG, "Cert/key was not found in keystore - creating new key and certificate.");

            new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        CreateKeysAndCertificateRequest createKeysAndCertificateRequest =
                                new CreateKeysAndCertificateRequest();
                        createKeysAndCertificateRequest.setSetAsActive(true);
                        final CreateKeysAndCertificateResult createKeysAndCertificateResult;
                        createKeysAndCertificateResult =
                                mIotAndroidClient.createKeysAndCertificate(createKeysAndCertificateRequest);
                        Log.i(LOG_TAG,
                                "Cert ID: " +
                                        createKeysAndCertificateResult.getCertificateId() +
                                        " created.");

                        AWSIotKeystoreHelper.saveCertificateAndPrivateKey(certificateId,
                                createKeysAndCertificateResult.getCertificatePem(),
                                createKeysAndCertificateResult.getKeyPair().getPrivateKey(),
                                keystorePath, keystoreName, keystorePassword);

                        clientKeyStore = AWSIotKeystoreHelper.getIotKeystore(certificateId,
                                keystorePath, keystoreName, keystorePassword);

                        AttachPrincipalPolicyRequest policyAttachRequest =
                                new AttachPrincipalPolicyRequest();
                        policyAttachRequest.setPolicyName(AWS_IOT_POLICY_NAME);
                        policyAttachRequest.setPrincipal(createKeysAndCertificateResult
                                .getCertificateArn());
                        mIotAndroidClient.attachPrincipalPolicy(policyAttachRequest);

                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {

                                // Enable connect
                                connectClient();
                            }
                        });
                    } catch (Exception e) {
                        Log.e(LOG_TAG,
                                "Exception occurred when generating new private key and certificate.",
                                e);
                    }
                }
            }).start();
        }
    }

    private void connectClient() {

        Log.d(LOG_TAG, "clientId = " + clientId);

        try {
            mqttManager.connect(clientKeyStore, new AWSIotMqttClientStatusCallback() {
                @Override
                public void onStatusChanged(final AWSIotMqttClientStatus status,
                                            final Throwable throwable) {
                    Log.d(LOG_TAG, "Status = " + String.valueOf(status));

                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            if (status == AWSIotMqttClientStatus.Connecting) {

                            } else if (status == AWSIotMqttClientStatus.Connected) {

                                setSubscribe(NucleoApplication.getInstance().getTopic());

                            } else if (status == AWSIotMqttClientStatus.Reconnecting) {
                                if (throwable != null) {
                                    Log.e(LOG_TAG, "Connection error.", throwable);
                                }

                            } else if (status == AWSIotMqttClientStatus.ConnectionLost) {
                                if (throwable != null) {
                                    Log.e(LOG_TAG, "Connection error.", throwable);
                                }

                            } else {


                            }
                        }
                    });
                }
            });
        } catch (final Exception e) {
            Log.e(LOG_TAG, "Connection error.", e);

        }
    }

    private void setSubscribe(String topic) {

        Log.d(LOG_TAG, "topic = " + topic);

        try {
            mqttManager.subscribeToTopic(topic, AWSIotMqttQos.QOS0,
                    new AWSIotMqttNewMessageCallback() {
                        @Override
                        public void onMessageArrived(final String topic, final byte[] data) {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    try {
                                        String message = new String(data, "UTF-8");
                                        Log.d(LOG_TAG, "Message arrived:");
                                        Log.d(LOG_TAG, "   Topic: " + topic);
                                        Log.d(LOG_TAG, " Message: " + message);

                                        //TODO set temperature to chart


                                        try {
                                            JSONObject tJson = new JSONObject(message);

                                            float temperature = (float) tJson.getDouble("temperature");
                                            long time = tJson.getLong("timestamp");

                                            if(mStartDataResponse!=null && mStartDataResponse.sensorData!=null && mStartDataResponse.sensorData.size()!=0) {

                                                StartDataResponse.sensorData sensorData = mStartDataResponse.sensorData.get(0);

                                                sensorData.timestamp = time;
                                                sensorData.temperature = temperature;

                                                mStartDataResponse.sensorData.add(mStartDataResponse.sensorData.size() - 1, sensorData);

                                                mStartDataResponse.sensorData.remove(0);

                                                setData(mStartDataResponse, false);
                                            }

                                        } catch (JSONException e) {
                                            e.printStackTrace();
                                        }


                                    } catch (UnsupportedEncodingException e) {
                                        Log.e(LOG_TAG, "Message encoding error.", e);
                                    }
                                }
                            });
                        }
                    });
        } catch (Exception e) {
            Log.e(LOG_TAG, "Subscription error.", e);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (!EventBus.getDefault().isRegistered(this)) EventBus.getDefault().register(this);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        if (mStartDataResponse != null)
            setChart(mStartDataResponse);
    }

    @Override
    public void onStop() {
        super.onStop();
        EventBus.getDefault().unregister(this);

        if (cdd != null)
            cdd.dismiss();

}

    @Override
    protected void onResume() {
        super.onResume();
        if (mStartDataResponse != null)
            setChart(mStartDataResponse);
        setCity();
    }

    public void onEventMainThread(StartDataEvent eventResult) {

        switch (eventResult.getResult()) {

            case OK:

                pb.setVisibility(View.GONE);

                mStartDataResponse = (StartDataResponse) eventResult.getEntity();

                if (mStartDataResponse.weatherData != null) {

                    if (nameCity != null) {
                        nameCity.clear();
                        nameCity = null;
                    }

                    nameCity = new ArrayList<>();

                    if (mStartDataResponse.weatherData != null && mStartDataResponse.weatherData.size() != 0) {

                        for (int i = 0; i < mStartDataResponse.weatherData.size(); i++) {
                            nameCity.add(mStartDataResponse.weatherData.get(i).cityName);
                        }
                        NucleoApplication.getInstance().setNames(nameCity);
                    }
                }

                if (mStartDataResponse.sensorData != null) {


                    if (!isStartChartAnimation)
                        setChart(mStartDataResponse);
                    else
                        setData(mStartDataResponse, false);
                }

                break;
            case FAIL:
                Toast.makeText(MainActivity.this, eventResult.getErrorResponse().errorMessage, Toast.LENGTH_SHORT).show();
                break;
        }

    }

    @Override
    public void onChartGestureStart(MotionEvent me, ChartTouchListener.ChartGesture lastPerformedGesture) {
        Log.i("Gesture", "START, x: " + me.getX() + ", y: " + me.getY());
    }

    @Override
    public void onChartGestureEnd(MotionEvent me, ChartTouchListener.ChartGesture lastPerformedGesture) {
        Log.i("Gesture", "END, lastGesture: " + lastPerformedGesture);

        // un-highlight values after the gesture is finished and no single-tap
        if (lastPerformedGesture != ChartTouchListener.ChartGesture.SINGLE_TAP)
            mChart.highlightValues(null); // or highlightTouch(null) for callback to onNothingSelected(...)
    }

    @Override
    public void onChartLongPressed(MotionEvent me) {
        Log.i("LongPress", "Chart longpressed.");
    }

    @Override
    public void onChartDoubleTapped(MotionEvent me) {
        Log.i("DoubleTap", "Chart double-tapped.");
    }

    @Override
    public void onChartSingleTapped(MotionEvent me) {
        Log.i("SingleTap", "Chart single-tapped.");
    }

    @Override
    public void onChartFling(MotionEvent me1, MotionEvent me2, float velocityX, float velocityY) {
        Log.i("Fling", "Chart flinged. VeloX: " + velocityX + ", VeloY: " + velocityY);
    }

    @Override
    public void onChartScale(MotionEvent me, float scaleX, float scaleY) {
        Log.i("Scale / Zoom", "ScaleX: " + scaleX + ", ScaleY: " + scaleY);
    }

    @Override
    public void onChartTranslate(MotionEvent me, float dX, float dY) {
        Log.i("Translate / Move", "dX: " + dX + ", dY: " + dY);
    }

    @Override
    public void onValueSelected(Entry e, int dataSetIndex, Highlight h) {
        Log.i("Entry selected", e.toString());
        Log.i("LOWHIGH", "low: " + mChart.getLowestVisibleXIndex() + ", high: " + mChart.getHighestVisibleXIndex());
        Log.i("MIN MAX", "xmin: " + mChart.getXChartMin() + ", xmax: " + mChart.getXChartMax() + ", ymin: " + mChart.getYChartMin() + ", ymax: " + mChart.getYChartMax());
    }

    @Override
    public void onNothingSelected() {
        Log.i("Nothing selected", "Nothing selected.");
    }


    public class CustomDialogClass extends Dialog implements
            View.OnClickListener {

        public Activity c;
        public Button start;

        public CustomDialogClass(Activity a) {
            super(a);
        }

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            setContentView(R.layout.dialog_start);

            start = (Button) findViewById(R.id.start);
            start.setOnClickListener(this);

        }

        @Override
        public void onClick(View v) {
            switch (v.getId()) {
                case R.id.start:

                    long time = System.currentTimeMillis() - 86400000;

                    pb.setVisibility(View.VISIBLE);

                    StartDataJob startDataJob = new StartDataJob(String.valueOf(time / 1000));
                    jobManager.addJob(startDataJob);

                    dismiss();
                    break;
                default:
                    break;
            }
            dismiss();
        }
    }


}


