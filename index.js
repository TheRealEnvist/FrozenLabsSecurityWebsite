const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);
var apiService = "https://api.envistmakes.com/"

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

var SelectedGame = getCookie("SelectedGame")

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
    var headshots = await getRequest(apiService+"games/" + gameID+"/server/" +serverID+"/playerHeadshots/"+getCookie("webtoken")+"/false");
    const list = headshots.headshots
    const serverDisplay =  document.getElementById("playerDisplayRefrence")
    element.querySelector("#playerContainer").querySelector("#playerLoadingIcon").hidden = true
    element.querySelector("#playerContainer").querySelector("#playerLoadingIcon").style.display = "none"
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

    const gameID = SelectedGame;
    if (!gameID) {
        console.error('Game ID not found in URL.');
        return;
    }
    console.log('Game ID:', gameID);

    // Construct new URL
    const newUrl = `${window.location.origin}/Server/index.html?gameID=${encodeURIComponent(gameID)}&serverID=${encodeURIComponent(serverID)}`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

function loginButton(){
    const newUrl = `${window.location.origin}/login`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

async function onLoad(){
    SelectedGame = getCookie("SelectedGame")
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("NotLoggedIn").hidden = true;


    if(getCookie("webtoken") == null){
        document.cookie = "webtoken=a;"
    }

    var status = await getRequest(apiService+"profile/validateWebToken/"+getCookie("webtoken")+"/");
    if(status){
        if("validation" in status){
            if(!status["validation"]){
                document.getElementById("loginButton").style.display = "flex";
                document.getElementById("NotLoggedIn").hidden = false;
            }
         }else{
            document.getElementById("loginButton").style.display = "flex";
            document.getElementById("NotLoggedIn").hidden = false;
        }
    }else{
        document.getElementById("loginButton").style.display = "flex";
        document.getElementById("NotLoggedIn").hidden = false;
    }

    if(params.get("ip")!=null){
        apiService = params.get("ip")
    }
    var serverrespond = await getRequest(apiService+"status");   
    if(serverrespond.status){
        serverrespond = await getRequest(apiService+"games/" + SelectedGame+"/servers");
        document.getElementById("loadingIcon").hidden = true;
        document.getElementById("loadingIcon").style.display = "none";
        console.log(serverrespond);
        const serverDisplay = document.getElementById("serverDisplayReference")
        if(serverrespond.servers.errors != null){
            document.getElementById("serverError").hidden = false;
            document.getElementById("serverError").querySelector('#ErrorMessage').textContent = serverrespond.servers.errors["0"].message;
        }
        serverrespond["servers"]["data"].forEach((data, index, array) => {
            const serverClone = serverDisplay.cloneNode(true)
            serverClone.hidden = false
            serverClone.querySelector('#serverID').textContent = data["id"];
            document.getElementById("severDisplayList").appendChild(serverClone)
            loadPlayers(serverClone, gameID,data["id"]);
        });
    }else{
        document.getElementById("serverError").hidden = false;
        document.getElementById("loadingIcon").hidden = true;
        document.getElementById("loadingIcon").style.display = "none";
    }

}