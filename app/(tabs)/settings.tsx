import React, { Component } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  TextInput,
  Alert,
} from "react-native";
import { Text, View } from "../../components/Themed";
import local from "../../utils/AsyncStorage";
import { getDevaive } from "../../utils/utils";

interface StateProps {
  value: number;
  min: number;
  max: number;
  step: number;
}

export default class TabTwoScreen extends Component {
  constructor(props: StateProps) {
    super(props);
    // this.state = {
    //   value: this.props.value,
    //   max: this.props.max,
    //   min: this.props.min,
    //   step: this.props.step,
    //   accelermoter: 12.3,
    // };
  }
  static defaultProps: StateProps = {
    value: 3,
    min: 1,
    max: 100,
    step: 1,
  };
  // componentDidMount() {
  //   local
  //     .get("value")
  //     .then((res) => {
  //       this.setState({
  //         accelermoter: res,
  //       });
  //     })
  //     .catch((res) => {
  //       console.log(res);
  //     });
  // }

  // onpressEmail() {
  //   Communications.email(
  //     ["jh205@imperial.ac.uk"],
  //     null,
  //     null,
  //     "My Subject",
  //     JSON.stringify(json)
  //   );
  // }

  // onValueChange(value) {
  //   this.setState({ value });
  // }

  // accelermeter(e) {
  //   if (e === "" || e === null) {
  //     return false;
  //   }
  //   if (isNaN(e)) {
  //     Toast.fail("please enter number", 3);
  //     return false;
  //   } else {
  //     this.setState({
  //       accelermoter: e,
  //     });
  //   }
  // }

  // save() {
  //   if (this.state.accelermoter) {
  //     local.set("value", this.state.accelermoter);
  //   } else {
  //     Toast.fail("Can Not Be Empty", 3);
  //   }
  // }

  render() {
    return (
      <View style={{ padding: 15 }}>
        {/* <Text>Sampling frequency: {this.state.value}</Text> */}
        {/* <Slider
          maximumValue={this.state.max}
          minimumValue={this.state.min}
          step={this.state.step}
          value={this.state.value}
          onValueChange={(value) => this.onValueChange(value)}
        /> */}
        <Text style={{ marginTop: 15 }}>Acclerometer</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {/* <TextInput
            onChangeText={(e) => this.accelermeter(e)}
            style={{ width: "80%" }}
            keyboardType={"numeric"}
            defaultValue={`${this.state.accelermoter}`}
          /> */}
          <TouchableOpacity
            onPress={() => {
              // this.save();
            }}
            style={{
              backgroundColor: "red",
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 5,
              flexDirection: "row",
              alignSelf: "center",
            }}
          >
            <Text style={{ alignSelf: "center", color: "white" }}>SAVE</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Alert Title",
                "Do you want to delete all the data about this device",
                [
                  {
                    text: "Cancel",
                    onPress: () =>
                      ToastAndroid.show("Cancel", ToastAndroid.SHORT),
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      const device = getDevaive();
                      const gpsUrl = `https://ridecomfort-5e3bf.firebaseio.com/${device}/geolocation.json`;
                      const accUrl = `https://ridecomfort-5e3bf.firebaseio.com/${device}/accelerometer.json`;
                      const urlArr = [gpsUrl, accUrl];
                      urlArr.map((e, index) => {
                        fetch(e, {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          // body: JSON.stringify(jsonData),
                        })
                          .then((res) => {
                            console.log("删除数据", res);
                            ToastAndroid.show(`delete gps data success`, 1000);
                          })
                          .catch((err) => {
                            console.log("删除数据失败", err);
                          });
                      });
                    },
                  },
                ]
              );
            }}
          >
            <View
              style={{
                padding: 10,
                margin: 10,
                borderRadius: 5,
                backgroundColor: "#6D9CF9",
              }}
            >
              <Text style={{ textAlign: "center", color: "white" }}>
                Delete GPS Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Alert Title",
                "Do you want to delete all the data about this device",
                [
                  {
                    text: "Cancel",
                    onPress: () =>
                      ToastAndroid.show("Cancel", ToastAndroid.SHORT),
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      const device = getDevaive();
                      const url = `https://ridecomfort-5e3bf.firebaseio.com/${device}/trip.json`;
                      const urlArr = [url];
                      urlArr.map((e, index) => {
                        fetch(e, {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          // body: JSON.stringify(jsonData),
                        })
                          .then((res) => {
                            console.log("删除数据", res);
                            ToastAndroid.show(`delete trip data success`, 1000);
                          })
                          .catch((err) => {
                            console.log("删除数据失败", err);
                          });
                      });
                    },
                  },
                ]
              );
            }}
          >
            <View
              style={{
                padding: 10,
                margin: 10,
                borderRadius: 5,
                backgroundColor: "#6D9CF9",
              }}
            >
              <Text style={{ textAlign: "center", color: "white" }}>
                Delete Trip Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View>
          <Text>My Device Name: {getDevaive()}</Text>
        </View>
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
