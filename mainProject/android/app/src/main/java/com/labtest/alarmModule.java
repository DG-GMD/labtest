package com.labtest;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import java.util.Map;

//import javax.security.auth.callback.Callback;

import java.util.HashMap;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.widget.Button;
import android.widget.TimePicker;
import android.widget.Toast;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;

public class alarmModule extends ReactContextBaseJavaModule {
  private static final int WRITE_SETTINGS_PERMISSION_REQUEST_CODE = 100;
  private static final int OVERLAY_PERMISSION_REQUEST_CODE = 101;

  private static ReactApplicationContext reactContext;

  alarmModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @Override
  public String getName() {
    return "alarmModule";
  }

  public void simpleToast(String message){
    Toast.makeText(getReactApplicationContext(), message, Toast.LENGTH_SHORT).show();
  }

  @ReactMethod
  public void checkPermission(String pCode, Callback errorCallback, Callback successCallback){
    try{
      Context context = reactContext;
      Activity activity = getCurrentActivity();

      Boolean isPermitted = null;

      if(pCode.equals("Write"))
        isPermitted = Settings.System.canWrite(context);
      else if(pCode.equals("Overlay"))
        isPermitted = Settings.canDrawOverlays(context);

      successCallback.invoke(pCode, isPermitted);
    } catch (Exception e){
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void requirePermission(String pCode){
    Context context = reactContext;
    Activity activity = getCurrentActivity();

    if(pCode.equals("Write")){
      Uri uri = Uri.fromParts("package" , context.getPackageName(), null);
      Intent intent = new Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS, uri);
      activity.startActivityForResult(intent, WRITE_SETTINGS_PERMISSION_REQUEST_CODE);
    }
    else if(pCode.equals("Overlay")){
      Uri uri = Uri.fromParts("package" , context.getPackageName(), null);
      Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, uri);
      activity.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE);
    }
  }

  @ReactMethod
  public void diaryNotification(String isoString)
  {
    Context context = reactContext;
    Activity activity = getCurrentActivity();

    // SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
    // Date date = sdf.parse(isoString);

    // Calendar calendar = new GregorianCalendar();
    // calendar.setTime(date);

    LocalDateTime ldt = LocalDateTime.parse(isoString, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
    ZonedDateTime zdt = ldt.atZone(ZoneId.of("Asia/Seoul"));
    long millis = zdt.toInstant().toEpochMilli();

    Boolean dailyNotify = true; // 무조건 알람을 사용

    PackageManager pm = context.getPackageManager();
    ComponentName receiver = new ComponentName(context, DeviceBootReceiver.class);
    Intent alarmIntent = new Intent(context, AlarmReceiver.class);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, alarmIntent, 0);
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);


    // 사용자가 매일 알람을 허용했다면
    if (dailyNotify) {
      if (alarmManager != null) {

        alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, millis, AlarmManager.INTERVAL_DAY, pendingIntent);
        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, millis, pendingIntent);

        simpleToast("alarm fixed");
      }

      // 부팅 후 실행되는 리시버 사용가능하게 설정
      pm.setComponentEnabledSetting(receiver,
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
        PackageManager.DONT_KILL_APP);

    }
  }
}