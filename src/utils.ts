export function sleep(ms: number) {
    return new Promise(resolve =>  setTimeout(resolve, ms))
}

export function getDateTime(date: Date = new Date()) {
    const datestr = date.toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
    return {
        date: datestr.slice(0, 10),
        time: datestr.slice(11),
        datetime: datestr,
        toMidnight: () => {
            const d = new Date(datestr.slice(0, 10))
            d.setHours(0)
            return d
        }
    }
}