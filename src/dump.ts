import { Client, Pool } from "pg";

export class PsqlPoolClient {
    #options = {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_INIT || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        port: Number(process.env.DB_PORT) || 5432,
        max: Number(process.env.DB_POOL_MAX) || 20
    }
    #pool = new Pool(this.#options)

    constructor() {
        this.#pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err)
        })
    }

    query = async (query: string, args?: any[] | undefined) => {
        const client = await this.#pool.connect().catch(err => {
            console.error('Connection error', err)
            return undefined
        })
        if (!client) return Promise.reject('Not connected to database')
        try {
            return await client.query(query, args)
        } finally {
            client.release()
        }
    }
}


export const psqlClient = new PsqlPoolClient()

    ; (async () => {
        for (let i = 10; i < 50000; i++) {
            let res = await psqlClient.query(`INSERT INTO device (company_id, phone_no, device_code, device_code_valid, timezone, target, duplicates, active_on, status, active, create_on, write_on, create_uid, write_uid, pod_address, connection_status, device_id, imei, identifier) VALUES (1, 0813641645, 1002, false, 7, 1, 0, '2025-09-22 10:48:55.784 +0700', 1, TRUE, '2025-09-22 10:48:55.784 +0700', '2026-02-02 17:35:31.634 +0700', 1, 1, '10.10.203.88:2201', FALSE, ${i}, '1${i.toString().padStart(14, "0")}', ${i + 100});`);
        }
    })()