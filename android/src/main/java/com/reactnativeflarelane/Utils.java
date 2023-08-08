package com.reactnativeflarelane;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.Iterator;

public class Utils {

  public static WritableMap convertJsonToMap(JSONObject jsonObject) throws JSONException {
    WritableMap writableMap = new WritableNativeMap();

    Iterator<String> iterator = jsonObject.keys();
    while (iterator.hasNext()) {
      String key = iterator.next();
      Object value = jsonObject.get(key);

      if (value == JSONObject.NULL) {
        writableMap.putNull(key);
      } else if (value instanceof JSONObject) {
        writableMap.putMap(key, convertJsonToMap((JSONObject) value));
      } else if (value instanceof JSONArray) {
        writableMap.putArray(key, convertJsonToArray((JSONArray) value));
      } else if (value instanceof Boolean) {
        writableMap.putBoolean(key, (Boolean) value);
      } else if (value instanceof Integer) {
        writableMap.putInt(key, (Integer) value);
      } else if (value instanceof Double) {
        writableMap.putDouble(key, (Double) value);
      } else if (value instanceof String) {
        writableMap.putString(key, (String) value);
      } else {
        writableMap.putString(key, value.toString());
      }
    }

    return writableMap;
  }

  public static WritableArray convertJsonToArray(JSONArray jsonArray) throws JSONException {
    WritableArray writableArray = new WritableNativeArray();

    for (int i = 0; i < jsonArray.length(); i++) {
      Object value = jsonArray.get(i);
      if (value == JSONObject.NULL) {
        writableArray.pushNull();
      } else if (value instanceof JSONObject) {
        writableArray.pushMap(convertJsonToMap((JSONObject) value));
      } else if (value instanceof JSONArray) {
        writableArray.pushArray(convertJsonToArray((JSONArray) value));
      } else if (value instanceof Boolean) {
        writableArray.pushBoolean((Boolean) value);
      } else if (value instanceof Integer) {
        writableArray.pushInt((Integer) value);
      } else if (value instanceof Double) {
        writableArray.pushDouble((Double) value);
      } else if (value instanceof String) {
        writableArray.pushString((String) value);
      } else {
        writableArray.pushString(value.toString());
      }
    }

    return writableArray;
  }
}
