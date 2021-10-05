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
import com.flarelane.FlareLane;
import com.flarelane.Logger;
import com.flarelane.Notification;
import com.flarelane.NotificationConvertedHandler;

import org.json.JSONObject;

import java.util.ArrayList;


@ReactModule(name = FlareLaneModule.NAME)
public class FlareLaneModule extends ReactContextBaseJavaModule {
  public static final String NAME = "FlareLane";
  private ReactApplicationContext mReactApplicationContext;
  private Context context;

  public FlareLaneModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactApplicationContext = reactContext;
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  // ----- PUBLIC METHOD -----

  @ReactMethod
  public void initialize(String projectId) {
    try {
      context = mReactApplicationContext.getApplicationContext();
      FlareLane.initWithContext(context, projectId);
    } catch(Exception e) {
      Logger.error("exception");
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void setLogLevel(double logLevel) {
    int intLogLevel = (int) logLevel;
    FlareLane.setLogLevel(intLogLevel);
  }

// ----- EVENT HANDLERS -----

  public static void setNotificationConvertedHandler(Context context) {
    FlareLane.setNotificationConvertedHandler(new NotificationConvertedHandler() {

      @Override
      public void onConverted(Notification notification) {
        Logger.verbose("FlareLane-RN Sent convert event via headless");

        Intent service = new Intent(context.getApplicationContext(), FlareLaneNotificationConvertedService.class);
        Bundle bundle = new Bundle();
        bundle.putString("id", notification.id);
        bundle.putString("title", notification.title);
        bundle.putString("body", notification.body);
        bundle.putString("url", notification.url);
        service.putExtras(bundle);
        context.startService(service);
      }
    });

    Logger.verbose("FlareLane-RN setNotificationConvertedHandler completed");
  }

  // ----- SET DEVICE META DATA -----

  @ReactMethod
  public void setUserId(String userId) {
    FlareLane.setUserId(context, userId);
  }

  @ReactMethod
  public void setTags(ReadableMap tags) {
    try {
      JSONObject jsonObjectTags = new JSONObject(tags.toHashMap());
      FlareLane.setTags(context, jsonObjectTags);
    } catch (Exception e) {
      Logger.error("exception");
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void deleteTags(ReadableArray tags) {
    try {
      ArrayList arrayListTags = tags.toArrayList();
      FlareLane.deleteTags(context, arrayListTags);
    } catch (Exception e) {
      Logger.error("exception");
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void setIsSubscribed(boolean isSubscribed) {
    FlareLane.setIsSubscribed(context, isSubscribed);
  }
}
