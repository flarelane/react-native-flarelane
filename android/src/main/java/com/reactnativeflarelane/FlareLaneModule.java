package com.reactnativeflarelane;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.Callback;

import com.flarelane.FlareLane;
import com.flarelane.Notification;
import com.flarelane.NotificationClickedHandler;
import com.flarelane.NotificationForegroundReceivedHandler;
import com.flarelane.NotificationReceivedEvent;
import com.flarelane.SdkType;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;

import android.util.Log;


@ReactModule(name = FlareLaneModule.NAME)
public class FlareLaneModule extends ReactContextBaseJavaModule {
  public static final String NAME = "FlareLane";
  private ReactApplicationContext mReactApplicationContext;
  private Context context;
  private HashMap<String, NotificationReceivedEvent> notificationEventCache = new HashMap<String, NotificationReceivedEvent>();

  public FlareLaneModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactApplicationContext = reactContext;
    FlareLane.SdkInfo.type = SdkType.REACTNATIVE;
    FlareLane.SdkInfo.version = "1.5.0";
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  // ----- PUBLIC STATIC METHOD -----

  public static void setNotificationIcon(int notificationIcon) {
    FlareLane.setNotificationIcon(notificationIcon);
  }

  // ----- PUBLIC METHOD -----

  @ReactMethod
  public void initialize(String projectId, boolean requestPermissionOnLaunch) {
    try {
      context = mReactApplicationContext.getApplicationContext();
      FlareLane.initWithContext(context, projectId, requestPermissionOnLaunch);
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }

  @ReactMethod
  public void setLogLevel(double logLevel) {
    int intLogLevel = (int) logLevel;
    FlareLane.setLogLevel(intLogLevel);
  }

  // ----- EVENT HANDLERS -----
  @ReactMethod
  public void setNotificationClickedHandler() {
    FlareLane.setNotificationClickedHandler(new NotificationClickedHandler() {
      @Override
      public void onClicked(Notification notification) {
        Intent service = new Intent(context.getApplicationContext(), FlareLaneNotificationClickedService.class);
        service.putExtras(notification.toBundle());
        context.startService(service);
      }
    });
  }

  @ReactMethod
  public void setNotificationForegroundReceivedHandler() {
    FlareLane.setNotificationForegroundReceivedHandler(new NotificationForegroundReceivedHandler() {
      @Override
      public void onWillDisplay(NotificationReceivedEvent notificationReceivedEvent) {
        notificationEventCache.put(notificationReceivedEvent.getNotification().id, notificationReceivedEvent);
        Intent service = new Intent(context.getApplicationContext(), FlareLaneNotificationForegroundReceivedService.class);
        service.putExtras(notificationReceivedEvent.getNotification().toBundle());
        context.startService(service);
      }
    });
  }

  @ReactMethod
  public void displayNotification(String notificationId) {
    NotificationReceivedEvent event = notificationEventCache.get(notificationId);
    if (event != null) event.display();
  }

  // ----- SET DEVICE META DATA -----

  @ReactMethod
  public void setUserId(String userId) {
    FlareLane.setUserId(context, userId);
  }

  @ReactMethod
  public void getTags(Callback callback) {
    try {
      FlareLane.getTags(context, new FlareLane.GetTagsHandler() {
        @Override
        public void onReceiveTags(JSONObject tags) {
          try {
            callback.invoke(Utils.convertJsonToMap(tags));
          } catch (Exception e) {
            Log.e("FlareLane", Log.getStackTraceString(e));
          }
        }
      });
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }

  @ReactMethod
  public void setTags(ReadableMap tags) {
    try {
      JSONObject jsonObjectTags = new JSONObject(tags.toHashMap());
      FlareLane.setTags(context, jsonObjectTags);
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }

  @ReactMethod
  public void deleteTags(ReadableArray tags) {
    try {
      ArrayList arrayListTags = tags.toArrayList();
      FlareLane.deleteTags(context, arrayListTags);
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }

  @ReactMethod
  public void subscribe(boolean fallbackToSettings, Callback callback) {
    try {
      FlareLane.subscribe(context, fallbackToSettings, new FlareLane.IsSubscribedHandler() {
        @Override
        public void onSuccess(boolean isSubscribed) {
          if (callback != null)
            callback.invoke(isSubscribed);
        }
      });
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }

  @ReactMethod
  public void unsubscribe(Callback callback) {
    try {
      FlareLane.unsubscribe(context, new FlareLane.IsSubscribedHandler() {
        @Override
        public void onSuccess(boolean isSubscribed) {
          if (callback != null)
            callback.invoke(isSubscribed);
        }
      });
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }

  @ReactMethod
  public void isSubscribed(Callback callback) {
    try {
      boolean isSubscribed = FlareLane.isSubscribed(context);
      callback.invoke(isSubscribed);
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }

  @ReactMethod
  public void getDeviceId(Callback callback) {
    try {
      String deviceId = FlareLane.getDeviceId(context);
      callback.invoke(deviceId);
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }

  @ReactMethod
  public void trackEvent(String type, ReadableMap data) {
    try {
      FlareLane.trackEvent(context, type, data == null ? null : new JSONObject(data.toHashMap()));
    } catch (Exception e) {
      Log.e("FlareLane", Log.getStackTraceString(e));
    }
  }
}
