package com.reactnativeflarelane;

import android.content.Intent;
import android.os.Build;

import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import java.io.Serializable;
import java.util.HashMap;

public class FlareLaneNotificationClickedService extends HeadlessJsTaskService {
  @Override
  protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    if (intent == null) return null;
    Serializable extra = getNotificationExtra(intent);
    if (!(extra instanceof HashMap)) return null;
    @SuppressWarnings("unchecked")
    HashMap<String, Object> payload = (HashMap<String, Object>) extra;
    return new HeadlessJsTaskConfig(
      "FlareLane-NotificationClickedCallback",
      Arguments.makeNativeMap(payload),
      5000,
      true
    );
  }

  // Intent.getSerializableExtra(String) is deprecated on API 33+ in favor of
  // the typed overload. Branch on SDK_INT to avoid the deprecation warning
  // without taking a new androidx.core dependency.
  @SuppressWarnings("deprecation")
  private static Serializable getNotificationExtra(Intent intent) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      return intent.getSerializableExtra(
        FlareLaneModule.EXTRA_NOTIFICATION, Serializable.class);
    }
    return intent.getSerializableExtra(FlareLaneModule.EXTRA_NOTIFICATION);
  }
}
