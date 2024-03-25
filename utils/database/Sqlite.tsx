import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { AccelerometerData } from "../types";
import { BetterLogs } from "../HKutils";

/**
 * DatabaseManager 类管理 SQLite 数据库操作。
 */
class RDatabase {
  private dbName: string = "accelerometer.db";
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase(this.dbName);
    this.initDB();
  }

  /**
   * 执行 SQL 查询并返回一个 promise。
   * @param sql SQL 查询字符串。
   * @param params SQL 查询的参数。
   * @returns 执行结果的 promise。
   */
  private async executeSqlAsync(sql: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            console.error(error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * 获取数据库文件的路径。
   * @returns 数据库文件路径的 promise。
   */
  private async getDbFilePath(): Promise<string> {
    const rootDir = FileSystem.documentDirectory;
    return `${rootDir}${this.dbName}`;
  }

  /**
   * 检查数据库文件是否存在。
   * @param dbFilePath 数据库文件路径。
   * @returns 数据库文件存在则返回 true，否则返回 false。
   */
  private async checkDbExists(dbFilePath: string): Promise<boolean> {
    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    return fileInfo.exists;
  }

  /**
   * 如果数据库存在则打开，不存在则创建。
   * @returns 打开或创建的 SQLiteDatabase 对象。
   */
  private async openOrCreateDb(): Promise<SQLite.SQLiteDatabase> {
    const dbFilePath = await this.getDbFilePath();
    const dbExists = await this.checkDbExists(dbFilePath);

    if (!dbExists) {
      await this.initDB();
    }

    return SQLite.openDatabase(dbFilePath);
  }

  /**
   * 检查数据库中是否存在某个表。
   * @param tableName 要检查的表名。
   * @returns 表存在则返回 true，否则返回 false。
   */
  private async checkTableExists(tableName: string): Promise<boolean> {
    const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`;
    try {
      const result = await this.executeSqlAsync(sql, [tableName]);
      return result.rows.length > 0;
    } catch (error) {
      console.error(`检查表是否存在时出错: ${error}`);
      return false;
    }
  }

  /**
   * 向表注册中添加表条目。
   * @param tableName 要添加到注册中的表名。
   */
  private async addTableToRegistry(tableName: string) {
    const timestamp = Date.now();
    const readableTimestamp = new Date(timestamp).toLocaleString();
    const sql = `
      INSERT INTO table_registry (timestamp, table_name, readable_timestamp)
      VALUES (?, ?, ?);
    `;
    await this.executeSqlAsync(sql, [timestamp, tableName, readableTimestamp]);
  }

  /**
   * 更新表注册中的记录长度和导出时间。
   * @param tableName 要更新的表名。
   * @param recordLength 新的记录长度。
   * @param exportTime 新的导出时间。
   */
  private async updateTableRegistry(
    tableName: string,
    recordLength: number,
    exportTime: string
  ) {
    const sql = `
      UPDATE table_registry
      SET record_length = ?, export_time = ?
      WHERE table_name = ?;
    `;
    await this.executeSqlAsync(sql, [recordLength, exportTime, tableName]);
  }

  /**
   * 在数据库中初始化表注册。
   * 表结构说明:
   * +-------------------+------------------+--------------------------------+
   * | 列名              | 数据类型         | 描述                            |
   * +-------------------+------------------+--------------------------------+
   * | timestamp         | INTEGER          | 主键，创建时间戳                |
   * +-------------------+------------------+--------------------------------+
   * | table_name        | TEXT             | 存储的表名                      |
   * +-------------------+------------------+--------------------------------+
   * | readable_timestamp| TEXT             | 人类可读的时间格式              |
   * +-------------------+------------------+--------------------------------+
   * | record_length     | INTEGER          | 表中的记录行数                  |
   * +-------------------+------------------+--------------------------------+
   * | export_time       | TEXT             | 表的数据导出时间                |
   * +-------------------+------------------+--------------------------------+
   */
  private async initTableRegistry() {
    const sql = `
      CREATE TABLE IF NOT EXISTS table_registry (
        timestamp INTEGER PRIMARY KEY,
        table_name TEXT NOT NULL,
        readable_timestamp TEXT NOT NULL,
        record_length INTEGER DEFAULT 0,
        export_time TEXT DEFAULT 'Not export yet'
      );
    `;
    await this.executeSqlAsync(sql, []);
  }

  /**
   * 创建新数据表。
   * @returns 创建的新表名。
   */
  public async createNewDataTable(): Promise<string> {
    const count = await this.getCurrentTableCount();
    const tableName = `table_${(count + 1).toString().padStart(6, "0")}`;
    const sql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        timestamp INTEGER PRIMARY KEY,
        x REAL,
        y REAL,
        z REAL
      );
    `;
    await this.executeSqlAsync(sql, []);
    await this.updateTableCount();
    console.log(`Created new table: ${tableName}`);
    return tableName;
  }

  /**
   * 将数据保存到数据库中。
   * @param tableName 要保存数据的表名。
   * @param data 要保存的加速度计数据。
   */
  public save2Database(tableName: string, data: AccelerometerData) {
    this.db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO ${tableName} (x, y, z, timestamp) VALUES (?, ?, ?, ?);`,
        [data.x, data.y, data.z, data.timestamp],
        () => BetterLogs("数据保存成功"),
        (_, err) => {
          BetterLogs(`保存数据时出错: ${err}`);
          return false;
        }
      );
    });
  }

  /**
   * 初始化表计数。
   */
  private async initTableCount(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS table_count (
        id INTEGER PRIMARY KEY,
        count INTEGER DEFAULT 0
      );
    `;
    await this.executeSqlAsync(sql, []);
    await this.executeSqlAsync(
      "INSERT INTO table_count (id, count) VALUES (1, 0) ON CONFLICT(id) DO NOTHING;",
      []
    );
  }

  /**
   * 获取当前表的计数。
   * @returns 当前表计数。
   */
  private async getCurrentTableCount(): Promise<number> {
    const sql = "SELECT count FROM table_count WHERE id = 1;";
    const result = await this.executeSqlAsync(sql, []);
    if (result.rows.length > 0) {
      return result.rows.item(0).count;
    } else {
      throw new Error("无法检索表计数。");
    }
  }

  /**
   * 更新表计数。
   */
  private async updateTableCount(): Promise<void> {
    const sql = `
      UPDATE table_count
      SET count = count + 1
      WHERE id = 1;
    `;
    await this.executeSqlAsync(sql, []);
  }

  /**
   * 初始化数据库。
   * 创建必要的表并设置数据库。
   */
  private async initDB(): Promise<void> {
    try {
      console.log("正在初始化数据库...");
      const tableRegistryExists = await this.checkTableExists("table_registry");
      if (!tableRegistryExists) {
        await this.initTableRegistry();
        BetterLogs(`表 table_registry 已创建。`);
      } else {
        BetterLogs(`表 table_registry 已存在。`);
      }

      const tableCountExists = await this.checkTableExists("table_count");
      if (!tableCountExists) {
        await this.initTableCount();
        BetterLogs(`表 table_count 已创建。`);
      } else {
        BetterLogs(`表 table_count 已存在。`);
      }
    } catch (error) {
      console.error(`初始化数据库失败: ${error}`);
    }
  }
}

export default RDatabase;
