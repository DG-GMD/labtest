package com.labtest;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;

import java.util.Timer;
import java.util.TimerTask;

import android.widget.Toast;

public class RingtonePlayingService extends Service {
    //private final IBinder mBinder = new LocalBinder();

    private Ringtone ringtone;
    private Timer mTimer;

    // private Integer testInteger = 1;

    // public class LocalBinder extends Binder {
    //     RingtonePlayingService getService() {
    //         // Return this instance of LocalService so clients can call public methods
    //         return RingtonePlayingService.this;
    //     }
    // }

    public RingtonePlayingService() {
    }

    @Override
    public IBinder onBind(Intent intent) {
        //return mBinder;
        return null;
    }

    void startForegroundService(){
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 1, notificationIntent, 0);

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= 26) {
            String CHANNEL_ID = "ringtone_service_channel";
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID,
                    "Ringtone Service Channel",
                    NotificationManager.IMPORTANCE_LOW);

            ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE))
                    .createNotificationChannel(channel);

            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }
        Notification notification =  builder.setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .build();

        startForeground(1, notification);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId)
    {
        AudioManager mAudioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        mAudioManager.setStreamVolume(
            AudioManager.STREAM_ALARM, 
            (int)((float)(mAudioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM)) * 0.8), 
            AudioManager.FLAG_SHOW_UI
        );

        // RingtoneManager.setActualDefaultRingtoneUri(this,RingtoneManager.TYPE_ALARM, Uri.parse(this.getFilesDir().getAbsolutePath() + "/alarm.mp3"));
        // Uri uri = RingtoneManager.getActualDefaultRingtoneUri(this, RingtoneManager.TYPE_ALARM);
        // this.ringtone = RingtoneManager.getRingtone(this, uri);
        this.ringtone = RingtoneManager.getRingtone(this, Uri.parse(this.getFilesDir().getAbsolutePath() + "/alarm.mp3"));
        if (ringtone != null) {
            ringtone.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build());
            ringtone.play();
            this.mTimer = new Timer();
            mTimer.scheduleAtFixedRate(new TimerTask() {
                public void run() {
                    if (!ringtone.isPlaying()) {
                        ringtone.play();
                    }
                }
            }, 1000*1, 1000*1);
        }

        //String message = "Test integer is " + (++testInteger);
        //Toast.makeText(this, message, Toast.LENGTH_SHORT).show();

        startForegroundService();

        return START_NOT_STICKY;
    }

    // public void startRingtone(){
    //     String message = "Test integer is " + (++testInteger);
    //     Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    // }

    // public void stopRingtone(){
    //     ringtone.stop();
    // }

    @Override
    public void onDestroy()
    {
        //String message = "Test integer is " + (++testInteger);
        //Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        this.ringtone.stop();
        this.mTimer.cancel();
        stopForeground(true);
    }
}
