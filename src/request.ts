
import https from "https"
import { Data } from "./type"
import { sleep, getDateTime } from "./utils"
import { config } from "dotenv"

config()


let url = "https://kernel-data-raw.s3.ap-southeast-1.amazonaws.com/P6"
const date = getDateTime()

url += "/" + date.date.slice(0, -2) + String(Number(date.date.slice(8)) - 1).padStart(2, "0") + "-" + date.time.slice(0, 2) + "-1.log"


export async function* getData(...allowedModels: string[]) {

    let next: () => void | Data = () => { }

    https.get(url, function (response) {
        let tempString = ""
        response.on('data', async function (chunk) {
            console.log(chunk)
            response.pause();
            chunk += tempString
            tempString = ""
            const data = String(chunk).split("\n")
            for (let i = 0; i < data.length; i++) {
                try {
                    const result = JSON.parse(data[i]) as Data
                    if (![...allowedModels].includes(result.model)) continue
                    await new Promise(resolve => {
                        next = () => {
                            resolve(true)
                            return result
                        }
                    })
                } catch (e) {
                    tempString += data[i]
                }
            }
            response.resume();
        })
    });
    let start = Date.now()
    let nextBefore: () => void | Data = () => { }
    while (true) {
        await sleep(0)
        if (nextBefore == next) continue
        const result = next()
        if (result) {
            nextBefore = next
            yield result
            start = Date.now()
        } else {
            if (Date.now() - start > 5000) {
                break
            }
        }
    }
}


// EXAMPLE USAGE
// ;(async () => {
//     const x = getData("x3", "fmb130")
//     for await (const data of x) {
//         console.log(data)
//     }
//     // console.log(await x.next())
//     // await sleep(1000)
//     // console.log(await x.next())
//     // await sleep(1000)
//     // console.log(await x.next())
// })()