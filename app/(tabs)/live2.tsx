import React, { Component } from "react";
import { StyleSheet } from "react-native";
import GetGeo from "../../components/GeoLocation";
import ShowAccelerometer from "../../components/Accelerometer";
import ChartView from "../../components/ChartView";

import { Text, View } from "../../components/Themed";

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is live Page!</Text>
      {/* <GetGeo /> */}
      {/* <ShowAccelerometer />
       */}
      <ChartView />
    </View>
  );
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
