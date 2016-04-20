
package com.klikatech.nucleo.custom;

import android.content.Context;
import android.widget.TextView;

import com.github.mikephil.charting.components.MarkerView;
import com.github.mikephil.charting.data.CandleEntry;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.highlight.Highlight;
import com.github.mikephil.charting.utils.Utils;
import com.klikatech.nucleo.R;
import com.klikatech.nucleo.net.response.StartDataResponse;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class MyMarkerView extends MarkerView {

    private TextView tvContent;

    private StartDataResponse startDataResponse;

    public MyMarkerView(Context context, int layoutResource, StartDataResponse startDataResponse) {
        super(context, layoutResource);

        tvContent = (TextView) findViewById(R.id.tvContent);

        this.startDataResponse = startDataResponse;
    }

    // callbacks everytime the MarkerView is redrawn, can be used to update the
    // content (user-interface)
    @Override
    public void refreshContent(Entry e, Highlight highlight) {

        SimpleDateFormat dateFormatTime = new SimpleDateFormat("HH:mm:ss");
        dateFormatTime.setTimeZone(TimeZone.getTimeZone("UTC"));

        String time = "";
        if(startDataResponse.sensorData!=null&&startDataResponse.sensorData.size()!=0)
             time = dateFormatTime.format(startDataResponse.sensorData.get(e.getXIndex()).timestamp);

        if (e instanceof CandleEntry) {

            CandleEntry ce = (CandleEntry) e;
            tvContent.setText(Utils.formatNumber(ce.getHigh(), 2, true)+" \u00B0"+" @" + time);

        } else {

            tvContent.setText(Utils.formatNumber(e.getVal(), 2, true)+" \u00B0"+" @"+time);

        }
    }

    @Override
    public int getXOffset(float xpos) {
        // this will center the marker-view horizontally
        return -(getWidth() / 2);
    }

    @Override
    public int getYOffset(float ypos) {
        // this will cause the marker-view to be above the selected value
        return -getHeight();
    }
}
