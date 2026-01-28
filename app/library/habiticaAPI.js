
async function callHabiticaAPI(serverPathUrl,xClientHeader,credentials,method,postData) {

    // Validate that credentials have the required fields
    if(!serverPathUrl || !xClientHeader || !credentials || !credentials.uid || !credentials.apiToken || credentials.uid.trim() === "" || credentials.apiToken.trim() === ""){
        console.log("Habitica API: Missing or empty credentials");
        return false;
    }
    
    try {
        const options = {
            method: method, // *GET, POST, PUT, DELETE, etc.
            mode: "cors",
            cache: "no-cache",
            credentials: "omit",
            headers: {
                'x-client': xClientHeader,
                'Content-Type': 'application/json',
                'x-api-user': credentials.uid,
                'x-api-key': credentials.apiToken
            },
            referrerPolicy: "no-referrer"
        };

        // Only include a body for methods that support it and when postData is provided
        if (postData && method && method.toUpperCase() !== 'GET') {
            options.body = JSON.stringify(postData);
        }

        const response = await fetch(serverPathUrl, options);

        if (!response.ok) {
            console.error('Habitica API request failed:', response.status, response.statusText);
            return false;
        }

        return await response.json();
    } catch (err) {
        console.error('Habitica API fetch error:', err);
        return false;
    }
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

