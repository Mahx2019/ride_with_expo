import React, { useState, useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Text, View } from "./Themed";
import { Accelerometer } from "expo-sensors";
import { LineChart } from "react-native-gifted-charts";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AccelerometerData {
  timestamp: string[];
  x: number[];
  y: number[];
  z: number[];
}

const DataOrigin: AccelerometerData = {
  timestamp: [],
  x: [],
  y: [],
  z: [],
};

const renderData = {
  timestamp: [],
  x: [],
  y: [],
  z: [],
};

const MAX_DATA_POINTS = 20;

const App: React.FC = () => {
  const [data, setData] = useState<AccelerometerData>({
    timestamp: [],
    x: [],
    y: [],
    z: [],
  });

  useEffect(() => {
    subscribe();
    return () => Accelerometer.removeAllListeners();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@accelerometer_data");
        return jsonValue != null
          ? (JSON.parse(jsonValue) as AccelerometerData)
          : { x: [], y: [], z: [] };
      } catch (e) {
        console.error(e);
      }
    };

    fetchData().then((storedData) => {
      if (storedData && storedData.x.length > 0) {
        setData({ ...storedData, timestamp: [] });
      }
    });
  }, []);

  const subscribe = () => {
    Accelerometer.setUpdateInterval(500);

    Accelerometer.addListener(({ x, y, z }) => {
      setData((currentData) => {
        const renderData: AccelerometerData = {
          timestamp: [...currentData.timestamp, Date.now().toLocaleString()],
          x: [...currentData.x, x],
          y: [...currentData.y, y],
          z: [...currentData.z, z],
        };

        if (renderData.x.length > MAX_DATA_POINTS) {
          renderData.timestamp.shift();
          renderData.x.shift();
          renderData.y.shift();
          renderData.z.shift();
        }

        storeData(renderData);
        return renderData;
      });
    });
  };

  const storeData = async (data: AccelerometerData) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem("@accelerometer_data", jsonValue);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Accelerometer Data</Text>
      <LineChart
        data={renderData.x}
        data2={renderData.y}
        data3={renderData.z}
        height={120}
        width={Dimensions.get("window").width}
        hideDataPoints
        showVerticalLines
        maxValue={1.5}
        spacing={6}
        initialSpacing={0}
        color1="#FF0000"
        color2="#00FF00"
        color3="#0000FF"
        dataPointsHeight={6}
        dataPointsWidth={6}
        dataPointsColor1="blue"
        dataPointsColor2="green"
        dataPointsColor3="red"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 50,
  },
});

export default App;
