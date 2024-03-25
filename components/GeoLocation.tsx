import React, { useState, useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import Device from "expo-device";
import * as Location from "expo-location";

import { BetterLogs } from "../utils/HKutils";
import {
  addLocationListener,
  Geolocation,
} from "react-native-amap-geolocation";
import AMapLoader from "@amap/amap-jsapi-loader";

interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
    altitudeAccuracy: number;
    heading: number;
    speed: number;
  };
  timestamp: number;
}

export default function GetGeo() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  Geolocation.getCurrentPosition(({ coords }) => {
    console.log(coords);
  });

  useEffect(() => {
    (async () => {
      //   if (Platform.OS === "android" && !Device.isDevice) {
      //     setErrorMsg(
      //       "Oops, this will not work on Snack in an Android Emulator. Try it on your device!"
      //     );
      //     return;
      //   }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    const date = new Date(location.timestamp);
    text = `经纬度：${location.coords.latitude.toString()},${location.coords.longitude.toString()}\n时间戳：${date.toLocaleString()}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
  },
});
