export const sendData = async (url, method, body) => {
    return await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    })
}
