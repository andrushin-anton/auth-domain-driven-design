import Db from 'mysql2-async';

export const db = new Db({
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? 'root',
    database: process.env.MYSQL_DATABASE ?? 'feed_settings',
    port: parseFloat(process.env.MYSQL_PORT ?? '33062'),
});
