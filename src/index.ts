import { createConnection, Socket } from "net"

import cluster from "cluster"
import crypto from "crypto"

import { devices } from "./devices"
import { Data, masterToWorker, workerToMaster } from "./type";
import { getData } from "./request";
import { sleep } from "./utils";


const host = process.env.HOST || "localhost"
const port = process.env.PORT ? parseInt(process.env.PORT) : 2000


// DEVICES CONFIG: key from devices object
const device = devices[process.env.DEVICE || "concox"]

// TOTAL CLIENT: clientPerWorker * workerCount
const clientPerWorker = process.env.CLIENT_PER_WORKER ? parseInt(process.env.CLIENT_PER_WORKER) : 1
const workerCount = process.env.WORKER_COUNT ? parseInt(process.env.WORKER_COUNT) : 1

const waitForReply = String(process.env.WAIT_FOR_REPLY).toLowerCase() == "true" ? true : false

const generateDelay = process.env.GENERATE_DELAY ? parseInt(process.env.GENERATE_DELAY) : 10

const continuous = String(process.env.CONTINUOUS).toLowerCase() == "true" ? true : false

const liveDuration = continuous ? generateDelay * clientPerWorker : 0

const data = getData(device.model)
let currentData: Data

const download = async () => {
    for await (const x of data) {
        if (!x) break
        currentData = x
        await sleep(100)
    }
}
download()

if (cluster.isPrimary) {
    const imeiPool: string[] = []
    for (let i = 0; i < workerCount; i++) {
        let worker = cluster.fork()
        worker.on("message", (data: workerToMaster) => {
            if (imeiPool.indexOf(data.imei) < 0) {
                imeiPool.push(data.imei)
                worker.send({
                    uid: data.uid,
                    imei: data.imei,
                    allowed: true
                })
            } else {
                worker.send({
                    uid: data.uid,
                    imei: data.imei,
                    allowed: false
                })
            }
        })
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
    })
} else {
    let averageTime = 0
    function run(imei: string, cb: () => void) {
        let sendAllowed = false
        let sending = false
        let time: number

        const client = createConnection({ host, port })
        client.on("connect", () => {
            let first = true
            client.write(device.imeiToLoginPacket(imei))

            let stillRunning = true

            if (liveDuration){
                setTimeout(() => {
                    client.end()
                    stillRunning = false
                }, liveDuration)
            }

            const delay = 10000
            if (waitForReply) {
                let queuedAmount = 0
                let lastQueued = Date.now()
                function asd(customDelay = 0) {
                    setTimeout(() => {
                        if(!stillRunning) return
                        if (sendAllowed && currentData) {
                            if (first) {
                                first = false
                                cb()
                            }
                            time = Date.now()
                            if (!sending) {
                                sending = true
                                client.write(device.dataPacket(currentData))
                                if (queuedAmount > 0) {
                                    queuedAmount--
                                    asd(delay / 10)
                                } else {
                                    asd()
                                }
                            } else {
                                if (Date.now() - lastQueued > delay) {
                                    queuedAmount++
                                    lastQueued = Date.now()
                                }
                                asd(delay / 10)
                            }
                        } else {
                            asd(delay / 10)
                        }
                    }, customDelay ? customDelay : delay)
                }
                asd()
            } else {
                function dsa() {
                    setTimeout(() => {
                        if (!stillRunning) return
                        if (sendAllowed && currentData) {
                            if (first) {
                                first = false
                                cb()
                            }
                            time = Date.now()
                            if (!sending) sending = true
                            client.write(device.dataPacket(currentData))
                        }
                        dsa()
                    }, delay)
                }
                dsa()
            }
        })

        client.on("data", (data) => {
            if (sendAllowed && sending) {
                sending = false
                averageTime = (averageTime + (Date.now() - time)) / 2
            }
            const reply = device.loginReplyPacket(data.toString("hex"), () => sendAllowed = true)
            if (reply) {
                client.write(reply)
            }
        })

        client.on("error", (err) => {
            console.log(err)
        })

        client.on("close", () => {
            console.log("close")
        })
    }

    function generateAndcheckImei() {
        let imei = Math.floor(100000000000000 + Math.random() * 900000000000000)
        // let imei = 123456789012345
        process.send!({
            uid: crypto.randomUUID(),
            imei: imei.toString()
        })
    }

    setInterval(() => {
        console.log("worker:" + process.pid + " averageTime: " + averageTime)
    }, 10000)

    let counter = 0
    const logInterval = setInterval(() => {
        console.log("worker:" + process.pid + " counter: " + counter)
        if (counter == clientPerWorker) {
            clearInterval(logInterval)
        }
    }, 10000)



    process.on("message", (msg: masterToWorker) => {
        if (msg.allowed) {
            run(msg.imei, () => counter++)
        } else {
            generateAndcheckImei()
        }
    })

    let amount = 0
    const timer = setInterval(() => {
        generateAndcheckImei()
        amount++
        if (amount == clientPerWorker && !continuous) {
            clearInterval(timer)
        }
    }, generateDelay)
}