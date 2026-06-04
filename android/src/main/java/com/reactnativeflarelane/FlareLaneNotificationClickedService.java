package com.reactnativeflarelane;

import android.content.Intent;

import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import java.util.HashMap;

public class FlareLaneNotificationClickedService extends HeadlessJsTaskService {
  @Override
  protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    @SuppressWarnings("unchecked")
    HashMap<String, Object> payload =
      (HashMap<String, Object>) intent.getSerializableExtra(FlareLaneModule.EXTRA_NOTIFICATION);
    if (payload == null) return null;
    return new HeadlessJsTaskConfig(
      "FlareLane-NotificationClickedCallback",
      Arguments.makeNativeMap(payload),
      5000,
      true
    );
  }
}
