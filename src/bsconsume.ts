/**
 * Beanstalk Consumers
 * This file is used to consume the packets from the queue
 * Note that the packets are consumed by each workers, whereas each workers has 2 consumers
 * This script doesnt run on the container, you can run this script independently outside the container
 */


import Jackd from "jackd"
import cluster from "cluster";
import { config } from "dotenv"

config()


if (cluster.isPrimary) {

    for (let i = 0; i < 4; i++) {
        cluster.fork()
    }
    cluster.on("fork", (worker) => {
        console.log(`worker ${worker.process.pid} forked`);
    })
    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork()
    })
} else {
    for (let i = 0; i < 2; i++) {
        (async () => {
            const client = new Jackd()
            await client.connect({
                host: "127.0.0.1",
                port: 11300
            })
            await client.watch("PACKET")
            let shouldLog = String(process.env.LOG_BEANSTALK).toLowerCase() == "true"
            while (true) {
                let job = await client.reserve()
                shouldLog ? console.log(job) : null
                client.delete(job.id)
            }
        })()
    }

}