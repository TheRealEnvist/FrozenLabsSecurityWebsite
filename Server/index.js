const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);
var apiService = "https://api.envistmakes.com/"
const serverID = params.get("serverID")
const gameID = params.get("gameID")
const serverchat = io(apiService + `games/${gameID}/server/${serverID}/chat-server`);

serverchat.on('chat-message', (message) => {
    console.log('New message received:', message);
  });

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
    var headshots = await getRequest(apiService+"games/" + gameID+"/server/" +serverID+"/playerHeadshots");
    const list = headshots.headshots
    const PlayerDisplayContainer = document.getElementById("playerListDisplatReference").cloneNode(true);
    const ServerPlayerList = document.getElementById("PlayerContentContainer");
    document.getElementById("loadingIcon").hidden = true;
    document.getElementById("loadingIcon").style.display = "none";
    list.forEach((data, index, array) => {
        const PlayerDisplay = PlayerDisplayContainer.cloneNode(true);
        PlayerDisplay.style.display = ''
        PlayerDisplay.hidden = false;
        PlayerDisplay.querySelector("#playerDisplayRefrence").src = data["imageUrl"]
        PlayerDisplay.querySelector("#playerServerDisplayText").textContent = data["PlayerInformation"]["Display"]
        PlayerDisplay.querySelector("#playerServerUserDisplayText").textContent = "@" + data["PlayerInformation"]["Username"]
        ServerPlayerList.appendChild(PlayerDisplay);
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

async function onLoad(){
    document.getElementById('playerListDisplatReference').style.display = 'none';
    document.getElementById('MessageTemplate').style.display = 'none';
    loadPlayers(gameID, serverID)
}