import {
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from "react-native";
import React, { Component } from "react";
import { Text, View } from "../../components/Themed";
import { init } from "react-native-amap-geolocation";
import { BetterLogs } from "../../utils/HKutils";

export default class TabOneScreen extends Component {
  hasLocationPermission = async (type: String) => {
    if (
      Platform.OS === "ios" ||
      (Platform.OS === "android" && Platform.Version < 23)
    ) {
      return true;
    }
    let status = null;
    if (type === "file") {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );

      if (hasPermission) return true;

      status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
    } else if (type === "geo") {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (hasPermission) return true;

      status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
    } else if (type === "phone") {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      );

      if (hasPermission) return true;

      status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      );
    }

    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        "Location permission denied by user.",
        ToastAndroid.LONG
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        "Location permission revoked by user.",
        ToastAndroid.LONG
      );
    }

    return false;
  };
  checkPermission = async () => {
    await this.hasLocationPermission("file");
    await this.hasLocationPermission("geo");
    await init({
      ios: "",
      android: "043b24fe18785f33c491705ffe5b6935",
    });
  };
  componentDidMount() {
    BetterLogs("Component did mount!");
    // BetterLogs(Platform.OS);
    this.checkPermission();
  }
  render() {
    BetterLogs(this.props);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to your RideComfort app!</Text>
        <Text style={styles.version}>V1.0.0-reby hk</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  version: {
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
