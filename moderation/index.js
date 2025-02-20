const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);
var apiService = "https://api.envistmakes.com/"
var serverID = getCookie("SelectedServer")
var gameID = getCookie("SelectedGame")
var TargetedPlayer = getCookie("SelectedUser")
var TargetedPlayerDisplay = getCookie("SelectedUserDisplay")
var TargetedPlayerMugshot = getCookie("SelectedUserMugshot")
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

var actionsCompletion;

var AwaitingActionCompletion;
var AwaitingActionCompletionAction;

var ConnectionID;

async function connect() {

    const connectionkey = (await getRequest(apiService+`games/${gameID}/ConnectionKey/${getCookie("webtoken")}/`))["key"]

    ConnectionID = connectionkey

    actionsCompletion = io(`${apiService}games/${gameID}/server/${serverID}/actions/${connectionkey}`, {
        reconnection: true,             // Enable automatic reconnection
        reconnectionAttempts: Infinity, // Keep trying indefinitely
        reconnectionDelay: 1000,        // Start with a 1-second delay
        reconnectionDelayMax: 1000,     // Maximum delay of 1 seconds
        timeout: 5000,                 // Connection timeout (5 seconds)
    });

    actionsCompletion.on('actionCompleted', (message) => {
        console.log("Action completed recevied")
        console.log(message);
        if(message["actionID"] == AwaitingActionCompletion){
            ActionButtonCancel(AwaitingActionCompletionAction)
        }
    });

    actionsCompletion.on('connect_error', (error) => {
        console.error('Connection error:', error);
        serverID = getCookie("SelectedServer")
        gameID = getCookie("SelectedGame")
        const ChatContentContainer = document.getElementById("ChatContentContainer");
        const errorElement = document.createElement("div");
        errorElement.textContent = "Couldnt connect fully to the server player list may not update as expected.";
        errorElement.style.color = "red";
        ChatContentContainer.insertBefore(errorElement, ChatContentContainer.firstChild);
    });
}

connect();


// Listen for successful connection


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

async function ActionButton(action) {
    if(action=="Kick"){
        document.getElementById('KickWindow').style.display = null;
        document.getElementById('ModerationOverlay').hidden = null;
        var KickButtion = document.getElementById('KickWindow').querySelector(".ListContentContainerSidewaysCentered").querySelector("#KickButton")
        KickButtion.querySelector("#loadingIcon").style.display = "none";
        KickButtion.querySelector("#ButtonText").hidden = null;
    }
}

async function ActionButtonConfirm(action, element) {
    if(action=="Kick"){
        var KickReason = document.getElementById('KickWindow').querySelector('#Reason').value
        var RecordedReason = document.getElementById('KickWindow').querySelector('#RecordedReason').value
        element.querySelector("#loadingIcon").style.display = null;
        element.querySelector("#ButtonText").hidden = true;
        AwaitingActionCompletionAction = action;
        var actionAdd = await postRequest(apiService+`games/${gameID}/server/${serverID}/action/${ConnectionID}/true`,{
            player: TargetedPlayer, 
            reason: KickReason, 
            recordedReason: RecordedReason, 
            action: action
        })
        AwaitingActionCompletion = actionAdd["actionID"];
        console.log(actionAdd);
    }
}

async function ActionButtonCancel(action) {
    if(action=="Kick"){
        document.getElementById('KickWindow').style.display = "none";
        document.getElementById('ModerationOverlay').hidden = true;
    }
}

  function gameInfoButton(){
    const newUrl = `${window.location.origin}/games/GameInformation`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

function serversButton(){
    const newUrl = `${window.location.origin}/`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

async function onLoad(){
    document.getElementById('MessageTemplate').style.display = 'none';
    var UserPlate = document.getElementById("playerListDisplatReference")
    UserPlate.querySelector("#playerServerUserDisplayText").textContent = "@"+TargetedPlayer
    UserPlate.querySelector("#playerServerDisplayText").textContent = TargetedPlayerDisplay
    UserPlate.querySelector("#playerDisplayRefrence").src = TargetedPlayerMugshot
}
