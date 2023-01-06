import {clientCustomService} from "./custom.service.js";

function handleError(error) {
    console.log(error);
}

export function apiCall(url, header, payload, method) {

    const customService = clientCustomService.getInstance();

    const headers = new Headers({
        "Content-Type": "application/json",
    });

    console.log("Final session info", customService.sessionInfo);

    if (customService.sessionInfo && customService.sessionInfo["sid"]) {
        headers.append("X-session", customService.sessionInfo["sid"]);
    }

    if (header) {
        Object.keys(header).forEach((key, element) => {
            headers.append(key, header[key])
        })
    }

    const requestBody = new Request(url, {
        method: method,
        mode: 'cors',
        headers: headers,
        cache: 'default',
        body: JSON.stringify(payload),
    })

    return fetchAPI(requestBody);
}

function fetchAPI(requestBody) {
    return new Promise(async (resolve, reject) => {
        fetch(requestBody, {}).then(response => {
            const header = response.headers.get("Content-Type");
            if (response.ok && header && (header.indexOf('application/json') > -1))
                return response.json();
            else if (header && (header.indexOf('application/json') > -1))
                return response.json();
            else
                return response.text();
        }).then(data => {
            resolve(data);
        }).catch(error => {
            console.log("Error in API Service", error);
            reject(error);
        });
    })
}