// SQLite.tsx
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { AccelerometerData } from "../types";
import { BetterLogs } from "../HKutils";

const dbName = "accelerometer.db";
const db = SQLite.openDatabase(dbName);

// **********
// 通用功能
// **********
// 执行 SQL 语句
const executeSqlAsync = async (sql: string, params: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          console.error(error);
          reject(error);
          return false; // 或者根据您的逻辑返回 true
        }
      );
    });
  });
};

// 获取数据库文件的完整路径
const getDbFilePath = async (): Promise<string> => {
  const rootDir = FileSystem.documentDirectory; // 或 FileSystem.cacheDirectory
  return `${rootDir}${dbName}`;
};

// 检查数据库文件是否存在
const checkDbExists = async (dbFilePath: string): Promise<boolean> => {
  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  return fileInfo.exists;
};

export const openOrCreateDb = async (): Promise<SQLite.SQLiteDatabase> => {
  const dbFilePath = await getDbFilePath();
  const dbExists = await checkDbExists(dbFilePath);

  if (!dbExists) {
    await initDB(dbFilePath);
  }

  return SQLite.openDatabase(dbFilePath);
};

// 检查表是否存在
const checkTableExists = async (tableName: string): Promise<boolean> => {
  const sql = `
    SELECT name FROM sqlite_master
    WHERE type='table' AND name=?;
  `;

  try {
    const result = await executeSqlAsync(sql, [tableName]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking if table exists: ${error}`);
    return false;
  }
};

// **********
// 管理表功能
// **********
// +------------------+------------------+--------------------------------+
// | Column Name      | Data Type        | Description                    |
// +------------------+------------------+--------------------------------+
// | timestamp        | INTEGER          | 主键，记录表的创建时间戳          |
// +------------------+------------------+--------------------------------+
// | table_name       | TEXT             | 存储的表的名称                    |
// +------------------+------------------+--------------------------------+
// | readable_timestamp| TEXT            | 人类可读的时间格式，对应于timestamp  |
// +------------------+------------------+--------------------------------+
// | record_length    | INTEGER          | 记录表中的数据行数，默认为0        |
// +------------------+------------------+--------------------------------+
// | export_time      | TEXT             | 表的数据导出时间，默认为'Not export yet' |
// +------------------+------------------+--------------------------------+

const addTableToRegistry = async (tableName: string) => {
  const timestamp = Date.now();
  const readableTimestamp = new Date(timestamp).toLocaleString();
  const sql = `
    INSERT INTO table_registry (timestamp, table_name, readable_timestamp)
    VALUES (?, ?, ?);
  `;

  await executeSqlAsync(sql, [timestamp, tableName, readableTimestamp]);
};

// 更新管理表信息
const updateTableRegistry = async (
  tableName: string,
  recordLength: number,
  exportTime: string
) => {
  const sql = `
    UPDATE table_registry
    SET record_length = ?, export_time = ?
    WHERE table_name = ?;
  `;

  await executeSqlAsync(sql, [recordLength, exportTime, tableName]);
};

// 初始化管理表
const initTableRegistry = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS table_registry (
      timestamp INTEGER PRIMARY KEY,
      table_name TEXT NOT NULL,
      readable_timestamp TEXT NOT NULL,
      record_length INTEGER DEFAULT 0,
      export_time TEXT DEFAULT 'Not export yet'
    );
  `;

  await executeSqlAsync(sql, []);
};

// **********
// 数据表功能
// **********
// +-------------+------------+-----------------------------------+
// | Column Name | Data Type  | Description                       |
// +-------------+------------+-----------------------------------+
// | timestamp   | INTEGER    | 数据记录的时间戳, 主键              |
// +-------------+------------+-----------------------------------+
// | x           | REAL       | 加速度计的 X 轴数据                |
// +-------------+------------+-----------------------------------+
// | y           | REAL       | 加速度计的 Y 轴数据                |
// +-------------+------------+-----------------------------------+
// | z           | REAL       | 加速度计的 Z 轴数据                |
// +-------------+------------+-----------------------------------+
// 创建新数据表
const createNewDataTable = async (): Promise<string> => {
  const count = await getCurrentTableCount();
  const tableName = `table_${(count + 1).toString().padStart(6, "0")}`;

  const sql = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      timestamp INTEGER PRIMARY KEY,
      x REAL,
      y REAL,
      z REAL
    );
  `;

  await executeSqlAsync(sql, []);
  await updateTableCount();

  console.log(`Created new table: ${tableName}`);
  return tableName;
};

// 保存数据到数据库
const save2Database = (tableName: string, data: AccelerometerData) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO ${tableName} (x, y, z, timestamp) VALUES (?, ?, ?, ?);`,
      [data.x, data.y, data.z, data.timestamp],
      () => BetterLogs("Data saved successfully"),
      (_, err) => {
        BetterLogs(`Error saving data: ${err}`);
        return false; // 返回 false 以回滚事务
      }
    );
  });
};

// **********
// 计数表功能
// **********
// +-------------+------------+--------------------------------+
// | Column Name | Data Type  | Description                    |
// +-------------+------------+--------------------------------+
// | id          | INTEGER    | 主键，用于唯一标识记录           |
// +-------------+------------+--------------------------------+
// | count       | INTEGER    | 存储已创建表的数量               |
// +-------------+------------+--------------------------------+
const initTableCount = async (): Promise<void> => {
  const sql = `
    CREATE TABLE IF NOT EXISTS table_count (
      id INTEGER PRIMARY KEY,
      count INTEGER DEFAULT 0
    );
  `;

  await executeSqlAsync(sql, []);
  await executeSqlAsync(
    "INSERT INTO table_count (id, count) VALUES (1, 0) ON CONFLICT(id) DO NOTHING;",
    []
  );
};

// 获取当前表计数
const getCurrentTableCount = async (): Promise<number> => {
  const sql = "SELECT count FROM table_count WHERE id = 1;";

  const result = await executeSqlAsync(sql, []);
  if (result.rows.length > 0) {
    return result.rows.item(0).count;
  } else {
    throw new Error("Unable to retrieve table count.");
  }
};

// 更新表计数
const updateTableCount = async (): Promise<void> => {
  const sql = `
    UPDATE table_count
    SET count = count + 1
    WHERE id = 1;
  `;

  await executeSqlAsync(sql, []);
};

// **********
// 初始化数据库
// **********
export const initDB = async (dbFilePath: string): Promise<void> => {
  try {
    console.log("Initializing database...");
    const tableRegistryExists = await checkTableExists("table_registry");
    if (!tableRegistryExists) {
      await initTableRegistry();
      BetterLogs(`Table table_registry created.`);
    } else {
      BetterLogs(`Table table_registry exists.`);
    }

    const tableCountExists = await checkTableExists("table_count");
    if (!tableCountExists) {
      await initTableCount();
      BetterLogs(`Table table_count created.`);
    } else {
      BetterLogs(`Table table_count exists.`);
    }
  } catch (error) {
    console.error(`初始化数据库失败 ${error}`);
  }
};
