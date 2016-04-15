package com.klikatech.nucleo.activity;

import android.app.Activity;
import android.app.Dialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.github.mikephil.charting.animation.Easing;
import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.Legend;
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
import com.github.mikephil.charting.utils.Utils;
import com.klikatech.nucleo.NucleoApplication;
import com.klikatech.nucleo.R;
import com.klikatech.nucleo.custom.MyMarkerView;
import com.klikatech.nucleo.custom.XAxisValueFormat;
import com.klikatech.nucleo.event.StartDataEvent;
import com.klikatech.nucleo.job.StartDataJob;
import com.klikatech.nucleo.net.response.StartDataResponse;
import com.path.android.jobqueue.JobManager;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;

import java.util.ArrayList;
import java.util.List;

import de.greenrobot.event.EventBus;

public class MainActivity extends AppCompatActivity implements OnChartGestureListener, OnChartValueSelectedListener {

    ProgressBar pb;

    JobManager jobManager = NucleoApplication.getInstance().getJobManager();
    List<String> nameCity;

    private StartDataResponse mStartDataResponse;

    private LineChart mChart;

    public final String TAG_mqtt = "MQTT";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.activity_main);

        if(!NucleoApplication.getInstance().isStart) {
            CustomDialogClass cdd = new CustomDialogClass(MainActivity.this);
            cdd.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
            cdd.show();
            NucleoApplication.getInstance().isStart = true;
        }
        else{

            long time= System.currentTimeMillis()- 86400000;
            StartDataJob startDataJob = new StartDataJob(String.valueOf(time/1000));
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

        //startMqtt();

        //setChart();

    }

    private void setCity(){

        List<String> s = NucleoApplication.getInstance().getSelectedCity();

        TextView tcity2 = (TextView) findViewById(R.id.tv_city2);
        TextView tcity3 = (TextView) findViewById(R.id.tv_city3);
        TextView tcity4 = (TextView) findViewById(R.id.tv_city4);
        TextView tcity5 = (TextView) findViewById(R.id.tv_city5);
        TextView tcity6 = (TextView) findViewById(R.id.tv_city6);

        if(s!=null && s.size()>0){
            if(s.size()<3){
                findViewById(R.id.l_city2).setVisibility(View.GONE);

                if(s.size()==1){
                    tcity2.setVisibility(View.VISIBLE);
                    tcity3.setVisibility(View.GONE);

                    tcity2.setText(s.get(0));

                }else{
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

                if(s.size()==3){

                    tcity4.setVisibility(View.VISIBLE);
                    tcity5.setVisibility(View.GONE);
                    tcity6.setVisibility(View.GONE);

                    tcity4.setText(s.get(2));
                }

                if(s.size()==4){

                    tcity4.setVisibility(View.VISIBLE);
                    tcity5.setVisibility(View.VISIBLE);
                    tcity6.setVisibility(View.GONE);

                    tcity4.setText(s.get(2));
                    tcity5.setText(s.get(3));
                }

                if(s.size()==5){

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

        // create a custom MarkerView (extend MarkerView) and specify the layout
        // to use for it
        MyMarkerView mv = new MyMarkerView(this, R.layout.custom_marker_view);

        // set the marker to the chart
        mChart.setMarkerView(mv);


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
        setData(startDataResponse);
        mChart.animateX(2500, Easing.EasingOption.EaseInOutQuart);
        mChart.invalidate();
    }

    private void setData(StartDataResponse startDataResponse) {
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

        if(NucleoApplication.getInstance().getSelectedCity()!=null && NucleoApplication.getInstance().getSelectedCity().size()!=0) {
            List<Integer> colors = getCityColors();
            for (int i = 0; i < startDataResponse.weatherData.size(); i++) {

                if (NucleoApplication.getInstance().getSelectedCity().contains(startDataResponse.weatherData.get(i).cityName)) {

                    StartDataResponse.weatherData weatherData = startDataResponse.weatherData.get(i);

                    if (weatherData.tempData.size() > 0) {
                        ArrayList<Entry> yValsTemp = new ArrayList<Entry>();
                        yValsTemp.clear();
                        for (int j = 0; j < weatherData.tempData.size(); j++) {

                            int k = Math.round(xVals.size()*(weatherData.tempData.get(j).timestamp-startDataResponse.sensorData.get(0).timestamp)/
                                    (startDataResponse.sensorData.get(startDataResponse.sensorData.size()-1).timestamp-startDataResponse.sensorData.get(0).timestamp));


                            if(k<=xVals.size()-1)
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
                        set.setDrawFilled(!NucleoApplication.getInstance().isLine);
                        dataSets.add(set);
                    }
                }
            }
        }

        LineData data = new LineData(xVals, dataSets);

        // set data
        mChart.setData(data);
        mChart.notifyDataSetChanged();
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

    /*
    private void setChart(int count, List<Float>values){

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
        // mChart.setBackgroundColor(Color.GRAY);

        // create a custom MarkerView (extend MarkerView) and specify the layout
        // to use for it
        MyMarkerView mv = new MyMarkerView(this, R.layout.custom_marker_view);

        // set the marker to the chart
        mChart.setMarkerView(mv);


        // x-axis limit line
        LimitLine llXAxis = new LimitLine(10f, "Index 10");
        llXAxis.setLineWidth(4f);
        llXAxis.enableDashedLine(10f, 10f, 0f);
        llXAxis.setLabelPosition(LimitLine.LimitLabelPosition.RIGHT_BOTTOM);
        llXAxis.setTextSize(10f);

        XAxis xAxis = mChart.getXAxis();
        //xAxis.setValueFormatter(new MyCustomXAxisValueFormatter());
        //xAxis.addLimitLine(llXAxis); // add x-axis limit line

        Typeface tf = Typeface.createFromAsset(getAssets(), "OpenSans-Regular.ttf");

        YAxis leftAxis = mChart.getAxisLeft();
        leftAxis.removeAllLimitLines(); // reset all limit lines to avoid overlapping lines

        leftAxis.setAxisMaxValue(50f);
        leftAxis.setAxisMinValue(-0f);
        //leftAxis.setYOffset(20f);
        leftAxis.enableGridDashedLine(10f, 10f, 0f);
        leftAxis.setDrawZeroLine(false);

        // limit lines are drawn behind data (and not on top)
        leftAxis.setDrawLimitLinesBehindData(true);

        mChart.getAxisRight().setEnabled(false);

        //mChart.getViewPortHandler().setMaximumScaleY(2f);
        //mChart.getViewPortHandler().setMaximumScaleX(2f);

        // add data
        setData(count, values);

//        mChart.setVisibleXRange(20);
//        mChart.setVisibleYRange(20f, AxisDependency.LEFT);
//        mChart.centerViewTo(20, 50, AxisDependency.LEFT);

        mChart.animateX(2500, Easing.EasingOption.EaseInOutQuart);
//        mChart.invalidate();

        // get the legend (only possible after setting data)
        Legend l = mChart.getLegend();

        // modify the legend ...
        // l.setPosition(LegendPosition.LEFT_OF_CHART);
        //l.setForm(Legend.LegendForm.LINE);

        // // dont forget to refresh the drawing
        // mChart.invalidate();
    }

    private void setData(int count, List<Float> range) {

        ArrayList<String> xVals = new ArrayList<String>();
        for (int i = 0; i < count; i++) {
            xVals.add((i) + "");
        }

        ArrayList<Entry> yVals = new ArrayList<Entry>();

        for (int i = 0; i < count; i++) {
            yVals.add(new Entry(range.get(i), i));
        }

        LineDataSet set1;

        if (mChart.getData() != null &&
                mChart.getData().getDataSetCount() > 0) {
            set1 = (LineDataSet)mChart.getData().getDataSetByIndex(0);
            set1.setYVals(yVals);
            mChart.getData().setXVals(xVals);
            mChart.notifyDataSetChanged();
        } else {
            // create a dataset and give it a type
            set1 = new LineDataSet(yVals, null);

            // set1.setFillAlpha(110);
            // set1.setFillColor(Color.RED);

            // set the line to be drawn like this "- - - - - -"
            set1.enableDashedLine(10f, 5f, 0f);
            set1.enableDashedHighlightLine(10f, 5f, 0f);
            set1.setColor(Color.BLACK);
            set1.setCircleColor(Color.BLACK);
            set1.setLineWidth(1f);
            set1.setCircleRadius(1f);
            set1.setDrawCircleHole(false);
            set1.setValueTextSize(9f);
            set1.setDrawFilled(true);

            if (Utils.getSDKInt() >= 18) {
                // fill drawable only supported on api level 18 and above
                Drawable drawable = ContextCompat.getDrawable(this, R.drawable.fade_blue);
                set1.setFillDrawable(drawable);
            }
            else {
                set1.setFillColor(Color.BLACK);
            }

            ArrayList<ILineDataSet> dataSets = new ArrayList<ILineDataSet>();
            dataSets.add(set1); // add the datasets

            // create a data object with the datasets
            LineData data = new LineData(xVals, dataSets);

            // set data
            mChart.setData(data);
        }
    }
    */

    private void startMqtt(){
        String clientId = MqttClient.generateClientId();
        MqttAndroidClient client =
                new MqttAndroidClient(this.getApplicationContext(), "wss://data.iot.us-east-1.amazonaws.com/mqtt",
                        clientId);

        try {
            IMqttToken token = client.connect();
            token.setActionCallback(new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    // We are connected
                    Log.d(TAG_mqtt, "onSuccess");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    // Something went wrong e.g. connection timeout or firewall problems
                    Log.d(TAG_mqtt, "onFailure");

                }
            });
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (!EventBus.getDefault().isRegistered(this)) EventBus.getDefault().register(this);
    }

    @Override
    public void onStop() {
        super.onStop();
        EventBus.getDefault().unregister(this);
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


                if(nameCity!=null) {
                    nameCity.clear();
                    nameCity = null;
                }

                nameCity = new ArrayList<>();

                for (int i = 0; i<mStartDataResponse.weatherData.size(); i++) {
                    nameCity.add(mStartDataResponse.weatherData.get(i).cityName);
                }

                NucleoApplication.getInstance().setNames(nameCity);

                List<Float> values = new ArrayList<Float>();

                for (int i = 0; i<mStartDataResponse.sensorData.size(); i++){
                    values.add(mStartDataResponse.sensorData.get(i).temperature);
                }

                setChart(mStartDataResponse);

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
        if(lastPerformedGesture != ChartTouchListener.ChartGesture.SINGLE_TAP)
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
            android.view.View.OnClickListener {

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

                    long time= System.currentTimeMillis()- 86400000;

                    pb.setVisibility(View.VISIBLE);

                    StartDataJob startDataJob = new StartDataJob(String.valueOf(time/1000));
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


