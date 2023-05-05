import { OkPacket, Pool, ResultSetHeader, RowDataPacket, createPool } from "mysql2";
import { config as envConfig } from "dotenv";
import { pino } from "pino";
import { DB } from "../lib/db";

const log = pino();

envConfig();

// 新建一个即时通讯应用的用户数据表

// 检测数据库中是否存在某个表
// SELECT COUNT(*) FROM information_schema.TABLES WHERE table_name = 'user';

const mysql_config = {
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
};

const sqlPool: Pool = createPool({
    ...mysql_config,
    ssl: {
        rejectUnauthorized: true,
    },
});

export abstract class MySql extends DB {
    public pool: Pool;
    constructor() {
        super();
        this.pool = sqlPool;
        this.init();
    }

    protected async query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        sql: string
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            this.pool.query<T>(sql, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    protected abstract init(): void;
}
