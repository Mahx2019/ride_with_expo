// /path/to/YourSensorChartComponent.tsx
import React, { Component } from "react";
import { Dimensions } from "react-native";
import { View } from "./Themed";
import { Accelerometer } from "expo-sensors";
import { LineChart } from "react-native-gifted-charts";
import { AccelerometerData } from "../utils/xxxx";

interface SensorChartComponentState {
  accelerometerData: number[];
}

class SensorChartComponent extends Component<{}, SensorChartComponentState> {
  private _subscription: any;

  constructor(props: {}) {
    super(props);
    this.state = {
      accelerometerData: [],
    };
  }

  componentDidMount() {
    Accelerometer.setUpdateInterval(100); // 更新频率为每秒
    this._subscription = Accelerometer.addListener(
      (data: AccelerometerData) => {
        const { x, y, z } = data;
        const newData = Math.sqrt(x * x + y * y + z * z); // 计算总加速度

        this.setState((prevState) => ({
          accelerometerData: [...prevState.accelerometerData, newData],
        }));
      }
    );
  }

  componentWillUnmount() {
    this._subscription && this._subscription.remove();
  }

  render() {
    const chartData = this.state.accelerometerData.map((value, index) => ({
      value,
      label: index.toString(),
    }));

    return (
      <View>
        <LineChart
          data={chartData}
          width={Dimensions.get("window").width - 16}
          height={220}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            color: () => `rgba(255, 255, 255, 1)`,
            labelColor: () => `rgba(255, 255, 255, 1)`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  }
}

export default SensorChartComponent;
