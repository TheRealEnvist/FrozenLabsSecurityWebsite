const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);

async function getRequest(url) {
    try {
        const response = await fetch(url, {
            mode: 'cors' // Ensure CORS mode
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parse the JSON response        
        return data;
    } catch (error) {
        console.error('GET request failed:', error);
        return {};
    }
    
}

// Function for POST request
async function postRequest(url, payload) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors', // Ensure CORS mode
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parse the JSON response
        return data;
    } catch (error) {
        console.error('POST request failed:', error);
        return {};
    }
}



async function onLoad(){
    var serverrespond = await getRequest("http://127.0.0.1:3000/status");   
    if(serverrespond.status){
        document.getElementById("loadingIcon").hidden = true;
        serverrespond = await getRequest("http://127.0.0.1:3000/games/" + params.get("gameID")+"/servers");
        const list = serverrespond.servers;
        const serverDisplay = document.getElementById("serverDisplayReference")
        for (let i = 0; i < list.length; i++) {
            const serverClone = serverDisplay.cloneNode(true)
            serverClone.hidden = false
            serverClone.querySelector('#serverID').textContent = list[i]["id"];
            document.getElementById("severDisplayList").appendChild(serverClone)
          }
    }else{
        document.getElementById("serverError").hidden = false;
        document.getElementById("loadingIcon").hidden = true;
    }
}