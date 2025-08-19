
async function callHabiticaAPI(serverPathUrl,xClientHeader,credentials,method,postData) {

    // Validate that credentials have the required fields
    if(!serverPathUrl || !xClientHeader || !credentials || !credentials.uid || !credentials.apiToken || credentials.uid.trim() === "" || credentials.apiToken.trim() === ""){
        console.log("Habitica API: Missing or empty credentials");
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
        body: JSON.stringify(postData), // body data type must match "Content-Type" header
      });
      return response.json(); // parses JSON response into native JavaScript objects
}

async function getHabiticaData(serverPathUrl, xClientHeader, credentials) {

    // Validate that credentials have the required fields
    if(!serverPathUrl || !xClientHeader || !credentials || !credentials.uid || !credentials.apiToken || credentials.uid.trim() === "" || credentials.apiToken.trim() === ""){
        console.log("Habitica API: Missing or empty credentials");
        var mockXhr = {
            status: 401,
            responseText: '{"error": "Missing authentication headers"}'
        };
        return mockXhr;
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

