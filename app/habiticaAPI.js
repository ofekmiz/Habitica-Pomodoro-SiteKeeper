function callHabiticaAPI(serverPathUrl,xClientHeader,credentials,method,postData) {
    if(!serverPathUrl || !xClientHeader || !credentials){
        return false;
    }
    
    // Validate that credentials have the required fields
    if(!credentials.uid || !credentials.apiToken || credentials.uid.trim() === "" || credentials.apiToken.trim() === ""){
        console.log("Habitica API: Missing or empty credentials");
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

function getHabiticaData(serverPathUrl,xClientHeader,credentials){
    if(!serverPathUrl || !xClientHeader || !credentials){
        return false;
    }
    
    // Validate that credentials have the required fields
    if(!credentials.uid || !credentials.apiToken || credentials.uid.trim() === "" || credentials.apiToken.trim() === ""){
        console.log("Habitica API: Missing or empty credentials");
        var mockXhr = {
            status: 401,
            responseText: '{"error": "Missing authentication headers"}'
        };
        return mockXhr;
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