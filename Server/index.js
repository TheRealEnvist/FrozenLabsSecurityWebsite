const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);
var apiService = "https://api.envistmakes.com/"
var serverID = getCookie("SelectedServer")
var gameID = getCookie("SelectedGame")
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

var serverchat;
var servercommunication;

async function connect() {

    const connectionkey = (await getRequest(apiService+`games/${gameID}/ConnectionKey/${getCookie("webtoken")}/`))["key"]

    serverchat = io(`${apiService}games/${gameID}/server/${serverID}/chat-server/${connectionkey}/false`, {
        reconnection: true,             // Enable automatic reconnection
        reconnectionAttempts: Infinity, // Keep trying indefinitely
        reconnectionDelay: 1000,        // Start with a 1-second delay
        reconnectionDelayMax: 1000,     // Maximum delay of 1 seconds
        timeout: 5000,                 // Connection timeout (5 seconds)
    });

    servercommunication = io(`${apiService}games/${gameID}/server/${serverID}/server-communication/${connectionkey}`, {
        reconnection: true,             // Enable automatic reconnection
        reconnectionAttempts: Infinity, // Keep trying indefinitely
        reconnectionDelay: 1000,        // Start with a 1-second delay
        reconnectionDelayMax: 1000,     // Maximum delay of 1 seconds
        timeout: 5000,                 // Connection timeout (5 seconds)
    });

    serverchat.on('connect', () => {
        console.log('Connected to the chat server.');
        const ChatContentContainer = document.getElementById("ChatContentContainer");
        ChatContentContainer.querySelector("#loadingIcon").style.display = "none";
        ChatContentContainer.querySelector("#loadingIcon").hidden = "true";
        const connectedElement = document.createElement("div");
        connectedElement.textContent = "Connected!";
        connectedElement.style.color = "lightgreen";
        ChatContentContainer.insertBefore(connectedElement, ChatContentContainer.firstChild);
        
    });

    servercommunication.on('updateList', () => {
        loadPlayers(gameID, serverID)
    });
    
    // Handle reconnection attempts
    serverchat.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt #${attemptNumber}`);
        const ChatContentContainer = document.getElementById("ChatContentContainer");
        ChatContentContainer.querySelector("#loadingIcon").style.display = "flex";
        ChatContentContainer.querySelector("#loadingIcon").hidden = "false";
        
    });
    
    // Handle successful reconnection
    serverchat.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts.`);
        const ChatContentContainer = document.getElementById("ChatContentContainer");
        ChatContentContainer.querySelector("#loadingIcon").style.display = "none";
        ChatContentContainer.querySelector("#loadingIcon").hidden = "true";
        
    });
    
    // Handle reconnection errors
    serverchat.on('reconnect_error', (error) => {
        console.error('Reconnection failed:', error);
    });
    
    // Handle permanent disconnection
    serverchat.on('disconnect', (reason) => {
        console.warn(`Disconnected: ${reason}`);
        if (reason === 'io server disconnect') {
            // If the server manually disconnected the client, try reconnecting
            serverchat.connect();
        }
    });
    
    // Handle incoming chat messages
    serverchat.on('chat-message', (message) => {
        const ChatContentContainer = document.getElementById("ChatContentContainer");
        ChatContentContainer.querySelector("#loadingIcon").style.display = "none";
        ChatContentContainer.querySelector("#loadingIcon").hidden = "true";
        
        const Template = document.getElementById("MessageTemplate").cloneNode(true);
        ChatContentContainer.insertBefore(Template, ChatContentContainer.firstChild);
        
        Template.querySelector(".BubbleContainerDark").querySelector(".UserName").textContent =
            `${message["display"]} @${message["username"]}`;
        Template.querySelector("#MessageContent").querySelector(".MessageContent").textContent =
            message["message"];
        Template.hidden = "false";
        Template.style.display = "flex";
    });
    
    // Optional: Provide feedback to the user about connection state
    serverchat.on('connect_error', (error) => {
        console.error('Connection error:', error);
        serverID = getCookie("SelectedServer")
        gameID = getCookie("SelectedGame")
        const ChatContentContainer = document.getElementById("ChatContentContainer");
        const errorElement = document.createElement("div");
        errorElement.textContent = "Connection error. Retrying... (The server may not be registered)";
        errorElement.style.color = "red";
        ChatContentContainer.insertBefore(errorElement, ChatContentContainer.firstChild);
    });

    servercommunication.on('connect_error', (error) => {
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

async function loadPlayers(gameID, serverID){
    var headshots = await getRequest(apiService+"games/" + gameID+"/server/" +serverID+"/playerHeadshots/"+getCookie("webtoken")+"/false");
    const list = headshots.headshots
    const PlayerDisplayContainer = document.getElementById("playerListDisplatReference").cloneNode(true);
    const ServerPlayerList = document.getElementById("PlayerContentContainer");
    document.getElementById("loadingIcon").hidden = true;
    document.getElementById("loadingIcon").style.display = "none";
    ServerPlayerList.replaceChildren();
    list.forEach((data, index, array) => {
        if(document.getElementById("nameplate_" + data["PlayerInformation"]["Username"]) == null){
            const PlayerDisplay = PlayerDisplayContainer.cloneNode(true);
            PlayerDisplay.style.display = ''
            PlayerDisplay.hidden = false;
            PlayerDisplay.id = "nameplate_" + data["PlayerInformation"]["Username"];
            PlayerDisplay.querySelector("#playerDisplayRefrence").src = data["imageUrl"]
            PlayerDisplay.querySelector("#playerServerDisplayText").textContent = data["PlayerInformation"]["Display"]
            PlayerDisplay.querySelector("#playerServerUserDisplayText").textContent = "@" + data["PlayerInformation"]["Username"]
            ServerPlayerList.appendChild(PlayerDisplay);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.querySelector(".RobloxChatMessage");
    const originalHeight = "20px"; // Store the original height for resetting

    chatBox.addEventListener("keydown", function (event) {
      // Check if the user presses "Enter" without "Shift"
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Prevent default action (adding a new line)

        // Simulate sending the message (e.g., log to console)
        console.log("Message sent:", chatBox.value);
        const ChatContentContainer = document.getElementById("ChatContentContainer");
        ChatContentContainer.querySelector("#loadingIcon").style.display = "none";
        ChatContentContainer.querySelector("#loadingIcon").hidden = "true";
        const Template = document.getElementById("MessageTemplate").cloneNode(true);
        ChatContentContainer.insertBefore(Template, ChatContentContainer.firstChild)
        Template.querySelector(".BubbleContainerDark").querySelector(".UserName").textContent = "Server"
        Template.querySelector("#MessageContent").querySelector(".MessageContent").textContent = chatBox.value
        Template.hidden = "false"
        Template.style.display = "flex";
        postRequest(apiService+"games/" + gameID+"/server/" +serverID+"/server-chat/"+getCookie("webtoken")+"/false", {
            add: true,
            message: chatBox.value
        })

        // Reset textarea content and height
        chatBox.value = "";
        chatBox.style.height = originalHeight;

        // Optionally unfocus the textarea
        chatBox.blur();
      }
    });

    let isAdjusting = false;

chatBox.addEventListener("input", function () {
  if (!isAdjusting) {
    isAdjusting = true;

    requestAnimationFrame(function adjustHeight() {
      chatBox.style.height = chatBox.scrollHeight - 10 + "px";

      if (chatBox.scrollHeight !== parseInt(chatBox.style.height)) {
        requestAnimationFrame(adjustHeight);
      } else {
        isAdjusting = false;
      }
    });
  }
});

  });

  function gameInfoButton(){
    const newUrl = `${window.location.origin}/games/GameInformation`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

function moderateUser(element){
    var username = element.querySelector("#playerServerUserDisplayText").textContent.split('@').join('');
    var display = element.querySelector("#playerServerDisplayText").textContent
    var mugshot = element.querySelector("#playerDisplayRefrence").src
    document.cookie = "SelectedUser="+username+"; Path=/; Secure; SameSite=true"
    document.cookie = "SelectedUserDisplay="+display+"; Path=/; Secure; SameSite=true"
    document.cookie = "SelectedUserMugshot="+mugshot+"; Path=/; Secure; SameSite=true"
    const newUrl = `${window.location.origin}/moderation/index.html`;
                    console.log('Redirecting to:', newUrl);
                    window.location.href = newUrl;
}

function serversButton(){
    const newUrl = `${window.location.origin}/`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

async function onLoad(){
    document.getElementById('playerListDisplatReference').style.display = 'none';
    document.getElementById('MessageTemplate').style.display = 'none';
    loadPlayers(gameID, serverID)
}
