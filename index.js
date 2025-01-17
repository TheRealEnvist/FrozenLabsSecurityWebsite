const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);
var apiService = "https://api.envistmakes.com/"

async function getRequest(url, nocors) {
    try {
        var response;
        if(nocors){
            response = await fetch(url, {
                mode: 'no-cors' // Ensure CORS mode
            });
        }else{
            response = await fetch(url, {
                mode: 'cors' // Ensure CORS mode
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json(); // Attempt to parse the error response
            throw { status: response.status, data: errorData };
        }
        const data = await response.json(); // Parse the JSON response
        data.status = response.status
        return data;
    } catch (error) {
        console.error('GET request failed:', error);
        return { message: 'An error occurred', status: error.status || 'unknown' };
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
            const errorData = await response.json(); // Attempt to parse the error response
            throw { status: response.status, data: errorData };
        }
        const data = await response.json(); // Parse the JSON response
        return data;
    } catch (error) {
        console.error('POST request failed:', error);
        return error.data || { message: 'An error occurred', status: error.status || 'unknown' };
    }
}

async function loadPlayers(element, gameID, serverID){
    var headshots = await getRequest(apiService+"games/" + gameID+"/server/" +serverID+"/playerHeadshots");
    const list = headshots.headshots
    const serverDisplay =  document.getElementById("playerDisplayRefrence")
    element.querySelector("#playerContainer").querySelector("#playerLoadingIcon").hidden = true
    for (let i = 0; i < list.length; i++) {
        const serverClone = serverDisplay.cloneNode(true)
        serverClone.hidden = false 
        serverClone.src = list[i]["imageUrl"]
        element.querySelector("#playerContainer").appendChild(serverClone)
      }
}

function onServerClick(element){
    const serverIDElement = element.querySelector('#serverID');
    if (!serverIDElement) {
        console.error('Server ID element not found.');
        return;
    }
    const serverID = serverIDElement.textContent.trim(); // Trim to avoid extra spaces
    console.log('Server ID:', serverID);

    const gameID = params.get('gameID');
    if (!gameID) {
        console.error('Game ID not found in URL.');
        return;
    }
    console.log('Game ID:', gameID);

    // Construct new URL
    const newUrl = `${window.location.origin}/server/index.html?gameID=${encodeURIComponent(gameID)}&serverID=${encodeURIComponent(serverID)}`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

async function onLoad(){
    if(params.get("ip")!=null){
        apiService = params.get("ip")
    }
    var serverrespond = await getRequest(apiService+"status");   
    if(serverrespond.status){
        document.getElementById("loadingIcon").hidden = true;
        serverrespond = await getRequest(apiService+"games/" + params.get("gameID")+"/servers");
        const list = serverrespond.servers;
        const serverDisplay = document.getElementById("serverDisplayReference")
        for (let i = 0; i < list.length; i++) {
            const serverClone = serverDisplay.cloneNode(true)
            serverClone.hidden = false
            serverClone.querySelector('#serverID').textContent = list[i]["id"];
            document.getElementById("severDisplayList").appendChild(serverClone)
            loadPlayers(serverClone, params.get("gameID"),list[i]["id"]);
          }
    }else{
        document.getElementById("serverError").hidden = false;
        document.getElementById("loadingIcon").hidden = true;
    }
}