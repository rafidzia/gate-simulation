import { concox } from "./concox"
import { Data } from "./type"

export const devices = {
    concox: {
        model: "x3",
        imeiToLoginPacket(imei: string) {
            const data = "11010" + imei + "20082bc10bec"
            return Buffer.from("7878" + data + concox.crc(data) + "0d0a", "hex")
        },
        dataPacket(data: Data) {
            // STILL USING RANDOMN DATA FROM RECORDS
            return Buffer.from(data.data, "hex")
        },
        loginReplyPacket(data: string, done: () => void) {
            if (data == "7878050110014c4d0d0a") {
                return Buffer.from("78780a1346060400020bef60b70d0a", "hex")
            }
            if (data.indexOf("787812800c0000000056455253494f4e231011e1b50d0a") >= 0) {
                done()
                return Buffer.from("797900332100000000015b56455253494f4e5d4e5433375f47543831305f574141445f56332e315f3232303930372e313631380bed993e0d0a", "hex")
            }
        }
    },
    teltonika: {
        model: "fmb130",
        imeiToLoginPacket(imei: string) {
            return Buffer.from("000F" + "3" + imei.split("").join("3"), "hex")
        },
        dataPacket(data: Data) {
            // STILL USING RANDOM DATA FROM RECORDS
            return Buffer.from(data.data, "hex")
        },
        loginReplyPacket(data: string, done: () => void) {
            // console.log(data)
            if (data == "000000000000000e0c010500000006676574766572010000a4c2") {
                done()
                return Buffer.from("000000000000009f0c0106000000975665723a30332e32372e30375f3030204750533a41584e5f352e312e392048773a464d42313330204d6f643a343320494d45493a33353730373332393534303837333220496e69743a323032332d31312d3120363a353820557074696d653a3130323431204d41433a303031453432374143454344205350433a312830292041584c3a32204f42443a3020424c3a312e31302042543a34010000621a", "hex")
            }
        }
    }
}