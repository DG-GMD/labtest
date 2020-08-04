package com.labtest;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import java.util.Calendar;

import android.os.Build;

import static android.content.Context.MODE_PRIVATE;

import android.widget.Toast;

import android.util.Log;

public class AlarmReceiver extends BroadcastReceiver {
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Intent startIntent = new Intent(context, RingtonePlayingService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(startIntent);
        } else {
            context.startService(startIntent);
        }

        Calendar nextNotifyTime = Calendar.getInstance();

        // 내일 같은 시간으로 알람시간 결정
        nextNotifyTime.add(Calendar.DATE, 1);

        //  Preference에 설정한 값 저장
        SharedPreferences.Editor editor = context.getSharedPreferences("daily alarm", MODE_PRIVATE).edit();
        editor.putLong("nextNotifyTime", nextNotifyTime.getTimeInMillis());
        editor.putBoolean("isAlarm", true);
        editor.apply();

        Intent intent_ = new Intent(context, MainActivity.class);
        intent_.putExtra("AlarmOn",true);
        intent_.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent_);
    }
}
