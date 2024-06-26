import Storage from "react-native-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

type key = any;
type data = any;
type expires = any;
type id = any;

const storage = new Storage({
  // 最大容量，默认值1000条数据循环存储
  size: 10000,

  // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
  // 如果不指定则数据只会保存在内存中，重启后即丢失
  storageBackend: AsyncStorage,

  // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
  // defaultExpires: 1000 * 3600 * 12,
  defaultExpires: 1000 * 60 * 60 * 24,

  // 读写时在内存中缓存数据。默认启用。
  enableCache: true,

  // 如果storage中没有相应数据，或数据已过期，
  // 则会调用相应的sync方法，无缝返回最新数据。
  // sync方法的具体说明会在后文提到
  // 你可以在构造函数这里就写好sync的方法
  // 或是在任何时候，直接对storage.sync进行赋值修改
  // 或是写到另一个文件里，这里require引入
  /* sync: require('你可以另外写一个文件专门处理sync') */
});

const local = {
  /**
   * 设置缓存
   * @params key  必传 唯一标识
   * @params data  数据  type：string || object
   * @params expires 过期时间  不传默认永久  单位：ms
   * @params id  非必传 标识
   *
   * */
  set(key: key, data: data, id: id) {
    const setValue = JSON.stringify(data);
    if (id) {
      storage.save({
        key,
        id,
        data: setValue,
      });
    } else {
      storage.save({
        key,
        data: setValue,
      });
    }
  },
  /**
   * 根据key 或者 key-id的到数据
   * @params key 必传
   * @params id  可为空
   *
   * */
  get(key: key, id: id) {
    if (id) {
      return storage
        .load({
          key,
          id,
        })
        .then((ret) => JSON.parse(ret))
        .catch((err) => {
          /**
           * 抛出错误
           * 注释部分为抛出详细错误
           * */
          throw err;
          /* switch (err.name) {
             case 'NotFoundError':
                 throw err.message;
                 break;
             case 'ExpiredError':
                 throw err.message;
                 break;
             default:throw '未知错误'
                 break;
         } */
        });
    }
    return storage
      .load({
        key,
      })
      .then((ret) => JSON.parse(ret))
      .catch((err) => {
        /**
         * 抛出错误
         * 注释部分为抛出详细错误
         * */
        throw err;
        /* switch (err.name) {
             case 'NotFoundError':
                 throw err.message;
                 break;
             case 'ExpiredError':
                 throw err.message;
                 break;
             default:throw '未知错误'
                 break;
         } */
      });
  },
  /**
   * 删除单个数据
   * key 必传
   * @params key 删除kay所对应的数据，必传
   *
   * @params id  删除id对应的数据 若删除的数据中有id，则必传
   */

  remove(key: key, id: id) {
    if (id) {
      storage.remove({
        key,
        id,
      });
    } else {
      storage.remove({
        key,
      });
    }
  },
  /**
   * 清空所有map，移除所有key-id数据（但会保留只有key的数据）
   * 测试 刷新之后有效，所以应该是在退出app时执行的
   * */
  clearMaps() {
    storage.clearMap();
  },
  /**
   * 清空某个key下的所有数据（仅key-id数据）
   * @paramas key
   * */
  clearMapForKey(key: key) {
    storage.clearMapForKey(key);
  },
  /**
   * 获取key下的 所有数据(仅key-id数据)
   * */
  getAllDataForKey(key: key) {
    console.log("获取离线数据", key);
    // return storage.getAllDataForKey(key).then(ret => ret);
    return storage
      .getAllDataForKey(key)
      .then((ret: any) => JSON.parse(ret))
      .catch((err) => {
        /**
         * 抛出错误
         * 注释部分为抛出详细错误
         * */
        throw err;
        /* switch (err.name) {
           case 'NotFoundError':
               throw err.message;
               break;
           case 'ExpiredError':
               throw err.message;
               break;
           default:throw '未知错误'
               break;
       } */
      });
  },
  /**
   * 获取某个key下的所有ID（仅key-id数据）
   * */
  getIdsForKey(key: key) {
    return storage.getIdsForKey(key).then((ids) => ids);
  },
};

export default local;
