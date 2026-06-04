package com.reactnativeflarelane;

import android.content.Intent;

import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import java.io.Serializable;
import java.util.HashMap;

public class FlareLaneNotificationForegroundReceivedService extends HeadlessJsTaskService {
  @Override
  protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    if (intent == null) return null;
    Serializable extra = intent.getSerializableExtra(FlareLaneModule.EXTRA_NOTIFICATION);
    if (!(extra instanceof HashMap)) return null;
    @SuppressWarnings("unchecked")
    HashMap<String, Object> payload = (HashMap<String, Object>) extra;
    return new HeadlessJsTaskConfig(
      "FlareLane-NotificationForegroundReceivedCallback",
      Arguments.makeNativeMap(payload),
      5000,
      true
    );
  }
}
