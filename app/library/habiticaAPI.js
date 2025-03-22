
async function callHabiticaAPI(serverPathUrl,xClientHeader,credentials,method,postData) {
    if(!serverPathUrl || !xClientHeader || !credentials){
        return false;
    }

    const response = await fetch(serverPathUrl, {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          'x-client': "application/json",
          'Content-Type': 'application/json',
          'x-api-user': credentials.uid,
          'x-api-key':credentials.apiToken

        },

        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      return response.json(); // parses JSON response into native JavaScript objects
}

async function getHabiticaData(serverPathUrl, xClientHeader, credentials) {
    if (!serverPathUrl || !xClientHeader || !credentials) {
        return false;
    }

    try {
        const response = await fetch(serverPathUrl, {
            method: "GET",
            headers: {
                'x-client': xClientHeader,
                'x-api-user': credentials.uid,
                'x-api-key': credentials.apiToken
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch Habitica data:", response.statusText);
            return false;
        }

        const data = await response.json(); // or text(), depending on expected format
        console.log("Fetched Habitica Data:",data);
        return data;
    } catch (e) {
        console.error("Fetch error:", e);
        return false;
    }
}


//Manifest V3 does not support XMLHttpRequest, use this for manifest V2 only
function callHabiticaAPI_MV2(serverPathUrl,xClientHeader,credentials,method,postData) {
    if(!serverPathUrl || !xClientHeader || !credentials){
        return false;
    }
    var xhr = new XMLHttpRequest();
    xhr.open(method, serverPathUrl, false);
    xhr.setRequestHeader('x-client', xClientHeader);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('x-api-user', credentials.uid);
    xhr.setRequestHeader('x-api-key', credentials.apiToken);
    if (typeof postData !== 'undefined') xhr.send(postData);
    else xhr.send();
    return (xhr.responseText);
}

//Manifest V3 does not support XMLHttpRequest, use this for manifest V2 only
function getHabiticaData_MV2(serverPathUrl,xClientHeader,credentials){
    if(!serverPathUrl || !xClientHeader || !credentials){
        return false;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", serverPathUrl, false);
    xhr.setRequestHeader('x-client', xClientHeader);
    xhr.setRequestHeader("x-api-user", credentials.uid);
    xhr.setRequestHeader("x-api-key", credentials.apiToken);
    try {
        xhr.send();
    } catch (e) {
        console.log(e);
    }
    return xhr;
}