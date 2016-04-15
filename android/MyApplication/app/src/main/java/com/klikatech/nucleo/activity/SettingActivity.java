package com.klikatech.nucleo.activity;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.view.WindowManager;
import android.widget.CompoundButton;
import android.widget.ListView;
import android.widget.RadioButton;

import com.klikatech.nucleo.NucleoApplication;
import com.klikatech.nucleo.R;
import com.klikatech.nucleo.adapter.CitiesAdapter;

/**
 * Created by manaa on 13.04.2016.
 */
public class SettingActivity extends AppCompatActivity {

    CitiesAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.activity_setting);

        adapter = new CitiesAdapter(this, R.layout.item_city, NucleoApplication.getInstance().getNames());
        final ListView lv = (ListView) findViewById(R.id.lv_cities);

        if(NucleoApplication.getInstance().getNames()!=null)
            lv.setAdapter(adapter);

        findViewById(R.id.b_home).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                SettingActivity.this.finish();
                adapter.saveSelected();
            }
        });


        final RadioButton rbLine = (RadioButton)findViewById(R.id.rb_line);
        final RadioButton rbArea = (RadioButton)findViewById(R.id.rb_area);

        if(NucleoApplication.getInstance().isLine)
            rbLine.setChecked(true);
        else
            rbArea.setChecked(true);

        rbLine.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {

                if(rbLine.isChecked())
                    NucleoApplication.getInstance().isLine = true;
            }
        });

        rbArea.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {

                if(rbArea.isChecked())
                    NucleoApplication.getInstance().isLine = false;
            }
        });
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();

        SettingActivity.this.finish();
        adapter.saveSelected();
    }
}
