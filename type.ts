export type Data = {
    data: string,
    imei: string,
    model: string,
    family: string,
    time: string
}

export type workerToMaster = {
    uid: string,
    imei: string
}

export type masterToWorker = {
    uid: string,
    imei: string,
    allowed: boolean
}