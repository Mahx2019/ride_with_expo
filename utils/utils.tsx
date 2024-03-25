// import RNFS from "react-native-fs";
import FileSystem from "expo-file-system";
import { Platform, ToastAndroid } from "react-native";
// import DeviceInfo from "react-native-device-info";
import * as Device from "expo-device";
import { BetterLogs } from "./HKutils";

type name = any;
type accelerometer = any[];
type Data = any[];
type obj = any;

// const rootPath =
//   Platform.OS === "android"
//     ? FileSystem.documentDirectory
//     : FileSystem.bundleDirectory;
// BetterLogs(rootPath);
const rootPath = "./";

export function transformJson(name: name) {
  const path = `${rootPath}${name}.txt`;
  const accelerometer: accelerometer = [];
  const myDatas = {
    time: [],
    AccelerometerX: [],
    AccelerometerY: [],
    AccelerometerZ: [],
  };
  return FileSystem.readAsStringAsync(path)
    .then((result) => {
      // console.log('result',result)
      if (result === "{}") {
        return {
          status: true,
        };
      }
      const data = result.split("}{");
      // console.log('数据格式化前',data)
      if (Array.isArray(data)) {
        // console.log('数组')
        if (Array.isArray(data) && data.length === 1) {
          let item = JSON.parse(data[0]);
          accelerometer.push(item);
          return {
            status: true,
            result: accelerometer,
          };
        }
        const last = data.length - 1;
        data.map((e, index) => {
          // let a = null;
          switch (index) {
            case 0:
              e = `${e}}`;
              break;
            case last:
              e = `{${e}`;
              break;
            default:
              e = `{${e}}`;
          }
          // Object.assign(accelerometer, JSON.parse(e))
          accelerometer.push(JSON.parse(e));
          const item = JSON.parse(e);
          const myDatas: Data = [];
          // console.log(item)
          for (const i in item) {
            if (item.hasOwnProperty(i)) {
              const subItem = item[i];
              if (subItem.length > 0) {
                for (const ele of subItem.values()) {
                  myDatas[i].push(ele);
                }
              }
            }
          }
          return e;
        });
      }
      // console.log('格式化后的数据', myDatas);
      return {
        status: true,
        result: myDatas,
      };
    })
    .catch((err) => {
      // console.log(err);
      // this.writeFile('accelerometer', {});
      return {
        status: false,
      };
    });
}

export function transformJsonGeo(name: name) {
  const path = `${rootPath}${name}.txt`;
  return FileSystem.readAsStringAsync(path)
    .then((result) => {
      // console.log(`${name}`,result)
      const data = result.split("}{");
      // console.log('transformJsonGeoArr', data)
      const len = data.length - 1;
      const myData: Data = [];

      if (result !== "{}") {
        if (Array.isArray(data) && data.length === 1) {
          let item = JSON.parse(data[0]);
          myData.push(item);
          return {
            status: true,
            result: myData,
          };
        }
        data.map((e, index) => {
          let item = null;
          switch (index) {
            case 0:
              item = JSON.parse(`${e}}`);
              break;
            case len:
              item = JSON.parse(`{${e}`);
              break;
            default:
              item = JSON.parse(`{${e}}`);
          }
          myData.push(item);
          return e;
        });
        console.log("transformJsonGeoArrAfterpush", myData);
      }
      return {
        status: true,
        result: myData,
      };
    })
    .catch((err) => {
      // console.log(err);
      // this.writeFile('accelerometer', {});
      return {
        status: false,
      };
    });
}

export function appendFile(name: name, data) {
  // create a path you want to write to
  const path = `${rootPath}${name}.txt`;
  const JsonData = JSON.stringify(data);
  return FileSystem.writeAsStringAsync(path, JsonData)
    .then((success) => {
      // console.log('写入Geo文件成功', success);
    })
    .catch((err) => {
      // console.log(err.message);
    });
}

export function transformJsonMarker(name: name) {
  const path = `${rootPath}${name}.txt`;
  return FileSystem.readAsStringAsync(path)
    .then((result) => {
      // console.log('result',result)
      const data = result.split("}{");
      const len = data.length - 1;
      const myData: Data = [];
      if (result !== "{}") {
        if (Array.isArray(data) && data.length === 1) {
          let item = JSON.parse(data[0]);
          myData.push(item);
          return {
            status: true,
            result: myData,
          };
        }
        data.map((e, index) => {
          let item = null;
          switch (index) {
            case 0:
              item = JSON.parse(`${e}}`);
              break;
            case len:
              item = JSON.parse(`{${e}`);
              break;
            default:
              item = JSON.parse(`{${e}}`);
          }
          myData.push(item);
          return e;
        });
      }
      return {
        status: true,
        result: myData,
      };
    })
    .catch((err) => {
      return {
        status: false,
      };
    });
}

export function deleteFile(name: name) {
  const path = `${rootPath}${name}.txt`;
  FileSystem.deleteAsync(path)
    .then(() => {
      console.log(`delete ${name}.txt scucess`);
      ToastAndroid.show(`delete ${name}.txt scucess`, ToastAndroid.SHORT);
    })
    // `unlink` will throw an error, if the item to unlink does not exist
    .catch((err) => {
      console.log(err.message);
    });
}

export function readFile(name: name) {
  const path = `${rootPath}${name}.txt`;
  return FileSystem.readAsStringAsync(path)
    .then((res) => {
      return {
        status: true,
        result: res,
      };
    })
    .catch((err) => {
      return {
        status: false,
      };
    });
}

//深度克隆
export function deepClone(obj: obj) {
  let result,
    oClass = isClass(obj);
  //确定result的类型
  if (oClass === "Object") {
    result = {};
  } else if (oClass === "Array") {
    result = [];
  } else {
    return obj;
  }
  for (const key in obj) {
    let copy = obj[key];
    if (isClass(copy) === "Object" || "Array") {
      result[key] = arguments.callee(copy); //递归调用
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}
//返回传递给他的任意对象的类
function isClass(o: any) {
  if (o === null) return "Null";
  if (o === undefined) return "Undefined";
  return Object.prototype.toString.call(o).slice(8, -1);
}

export function getDevaive() {
  const serialNumber = Device.osVersion;
  const brand = Device.brand;
  return `${serialNumber}${brand}`;
}
