export type Data = {
    data: string,
    imei: string,
    model: string,
    family: string,
    time: string
}

export type workerToMaster = {
    imei: string
    delete: boolean
}

export type masterToWorker = {
    imei: string,
    allowed: boolean
}