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
import com.flarelane.NotificationConvertedHandler;
import com.flarelane.NotificationManager;
import com.flarelane.SdkType;

import org.json.JSONObject;

import java.util.ArrayList;

import android.util.Log;


@ReactModule(name = FlareLaneModule.NAME)
public class FlareLaneModule extends ReactContextBaseJavaModule {
  public static final String NAME = "FlareLane";
  private ReactApplicationContext mReactApplicationContext;
  private Context context;

  public FlareLaneModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactApplicationContext = reactContext;
    FlareLane.SdkInfo.type = SdkType.REACTNATIVE;
    FlareLane.SdkInfo.version = "1.3.1";
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

  public static void setAccentColor(String accentColor) {
    NotificationManager.accentColor = accentColor;
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
  public void setNotificationConvertedHandler() {
    FlareLane.setNotificationConvertedHandler(new NotificationConvertedHandler() {

      @Override
      public void onConverted(Notification notification) {
        Log.v("FlareLane", "Send convert event via headless");

        Intent service = new Intent(context.getApplicationContext(), FlareLaneNotificationConvertedService.class);
        Bundle bundle = new Bundle();
        bundle.putString("id", notification.id);
        bundle.putString("title", notification.title);
        bundle.putString("body", notification.body);
        bundle.putString("url", notification.url);
        bundle.putString("imageUrl", notification.imageUrl);
        bundle.putString("data", notification.data);

        service.putExtras(bundle);
        context.startService(service);
      }
    });
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
  public void setIsSubscribed(boolean isSubscribed, Callback callback) {
    FlareLane.setIsSubscribed(context, isSubscribed, new FlareLane.IsSubscribedHandler() {
      @Override
      public void onSuccess(boolean isSubscribed) {
        callback.invoke(isSubscribed);
      }
    });
  }

  @ReactMethod
  public void subscribe(boolean fallbackToSettings, Callback callback) {
    FlareLane.subscribe(context, fallbackToSettings, new FlareLane.IsSubscribedHandler() {
      @Override
      public void onSuccess(boolean isSubscribed) {
        callback.invoke(isSubscribed);
      }
    });
  }

  @ReactMethod
  public void unsubscribe(Callback callback) {
    FlareLane.unsubscribe(context, new FlareLane.IsSubscribedHandler() {
      @Override
      public void onSuccess(boolean isSubscribed) {
        callback.invoke(isSubscribed);
      }
    });
  }

  @ReactMethod
  public void isSubscribed(Callback callback) {
    boolean isSubscribed = FlareLane.isSubscribed(context);
    callback.invoke(isSubscribed);
  }

  @ReactMethod
  public void getDeviceId(Callback callback) {
    String deviceId = FlareLane.getDeviceId(context);
    callback.invoke(deviceId);
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
