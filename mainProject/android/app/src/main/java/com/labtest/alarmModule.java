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
import android.media.RingtoneManager;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;

import static android.content.Context.MODE_PRIVATE;

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
  public void checkIsAlarm(Callback errorCallback, Callback successCallback){
    try{
      Context context = reactContext;

      SharedPreferences sharedPreferences = context.getSharedPreferences("daily alarm", MODE_PRIVATE);
      Boolean isAlarm = sharedPreferences.getBoolean("isAlarm", false);

      successCallback.invoke(isAlarm);
    } catch (Exception e){
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void startDict(Boolean admit){
    Context context = reactContext;

    RingtoneManager ringMan = new RingtoneManager(context);
    ringMan.stopPreviousRingtone();

    SharedPreferences.Editor editor = context.getSharedPreferences("daily alarm", MODE_PRIVATE).edit();
    editor.putBoolean("isAlarm", false);
    editor.apply();

    if(admit){
      simpleToast("admitted");
    }else{
      simpleToast("not admitted");
    }
  }

  @ReactMethod
  public void diaryNotification(String isoString)
  {
    Context context = reactContext;
    Activity activity = getCurrentActivity();

    PackageManager pm = context.getPackageManager();
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

    ComponentName receiver = new ComponentName(context, DeviceBootReceiver.class);
    Intent alarmIntent = new Intent(context, AlarmReceiver.class);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, alarmIntent, 0);
    
    LocalDateTime ldt = LocalDateTime.parse(isoString, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
    ZonedDateTime zdt = ldt.atZone(ZoneId.of("UTC"));
    long millis = zdt.toInstant().toEpochMilli();

    Calendar current_calendar = Calendar.getInstance();
    Calendar nextNotifyTime = new GregorianCalendar();
    nextNotifyTime.setTimeInMillis(millis);

    // if (current_calendar.after(nextNotifyTime)) {
    //     current_calendar.add(Calendar.DATE, 1);
    //     nextNotifyTime.set(current_calendar.get(Calendar.YEAR),current_calendar.get(Calendar.MONTH),current_calendar.get(Calendar.DATE));
    // }

    Date currentDateTime = nextNotifyTime.getTime();
    String date_text = new SimpleDateFormat("yyyy년 MM월 dd일 EE요일 a hh시 mm분 ", Locale.getDefault()).format(currentDateTime);
    Toast.makeText(context.getApplicationContext(),"다음 알람은 " + date_text + "으로 알람이 설정되었습니다!", Toast.LENGTH_SHORT).show();

    if (alarmManager != null){
      //alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextNotifyTime.getTimeInMillis(), pendingIntent);
      alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, nextNotifyTime.getTimeInMillis(), AlarmManager.INTERVAL_DAY, pendingIntent);
    }

    // 부팅 후 실행되는 리시버 사용가능하게 설정
    pm.setComponentEnabledSetting(receiver,
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
      PackageManager.DONT_KILL_APP);
  }
}