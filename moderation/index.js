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

var SelectedBanLength = "TimeStamp"

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
            if(AwaitingActionCompletionAction == "Kick" || AwaitingActionCompletionAction == "Ban"){
                backButton()
            }
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

async function UpdateBanSettings(element) {
    if(element.value == "Roblox"){
        document.getElementById('BanWindow').querySelector("#BanAltsSection").style.display = null;
    }else{
        document.getElementById('BanWindow').querySelector("#BanAltsSection").style.display = "none";
    }
}

async function CheckBox(element){
    if(element.dataset.Checked == "true"){
        element.dataset.Checked = "false";
        element.style = null
    }else{
        element.dataset.Checked = "true";
        element.style = "background-color: rgb(226, 226, 182);"
    }
}

function getHoursBetweenDates(date1, date2) {
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = date2 - date1;
  
    // Convert milliseconds to hours
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60); // 1000 ms per second, 60 seconds per minute, 60 minutes per hour
  
    return differenceInHours;
  }

  function addHoursToDate(date, hoursToAdd) {
    const newDate = new Date(date); // Make a copy of the original date
    newDate.setTime(newDate.getTime() + hoursToAdd * 60 * 60 * 1000); // Add hours in milliseconds
    return newDate;
  }

async function ActionButton(action) {
    if(action=="Kick"){
        document.getElementById('KickWindow').style.display = null;
        document.getElementById('ModerationOverlay').hidden = null;
        var KickButtion = document.getElementById('KickWindow').querySelector(".ListContentContainerSidewaysCentered").querySelector("#KickButton")
        KickButtion.querySelector("#loadingIcon").style.display = "none";
        KickButtion.querySelector("#ButtonText").hidden = null;
    }
    if(action=="Ban"){
        document.getElementById('BanWindow').style.display = null;
        document.getElementById('ModerationOverlay').hidden = null;
        var KickButtion = document.getElementById('BanWindow').querySelector(".ListContentContainerSidewaysCentered").querySelector("#ConfirmBanButton")
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
    if(action=="Ban"){
        var KickReason = document.getElementById('BanWindow').querySelector('#Reason').value
        var RecordedReason = document.getElementById('BanWindow').querySelector('#RecordedReason').value
        element.querySelector("#loadingIcon").style.display = null;
        element.querySelector("#ButtonText").hidden = true;
        AwaitingActionCompletionAction = action;
        var HoursToBan;
        var Data = {
            player: TargetedPlayer, 
            reason: KickReason, 
            recordedReason: RecordedReason,
            extraActionData: {
                Hours: 0,
                PermaBan: false,
                TimeStampOfUnBan: null,
                API: document.getElementById('BanWindow').querySelector('#BanAPI').value,
                BanAlts: document.getElementById('BanWindow').querySelector("#BanAlts").dataset.Checked,
                Reason: RecordedReason
            } ,
            action: action
        };
        if(SelectedBanLength == "TimeStamp"){
            var SelectedTime = new Date(document.getElementById('BanWindow').querySelector('#TimeStamp').value)
            var CurrentTime = new Date(Date.now());
            var Hours = getHoursBetweenDates(CurrentTime,SelectedTime);
            Data["extraActionData"]["Hours"] = Hours
            Data["extraActionData"]["TimeStampOfUnBan"] = SelectedTime
            
        }
        if(SelectedBanLength == "After"){
            var CurrentTime = Date.now();
            var multiplier = 1;
            var type = document.getElementById('BanWindow').querySelector('#BanAfterType').value
            if(type == "Days"){
                multiplier = 24;
            }
            if(type == "Days"){
                multiplier = 24;
            }
            if(type == "Weeks"){
                multiplier = 168;
            }
            if(type == "Months"){
                multiplier = 730;
            }
            if(type == "Years"){
                multiplier = 8760;
            }
            var Hours = document.getElementById('BanWindow').querySelector('#BanNumberSelector').value * multiplier
            Data["extraActionData"]["Hours"] = Hours 
            Data["extraActionData"]["TimeStampOfUnBan"] = addHoursToDate(CurrentTime, Hours)
        }
        if(SelectedBanLength == "Never"){
            Data["extraActionData"]["PermaBan"] = true            
        }
        var actionAdd = await postRequest(apiService+`games/${gameID}/server/${serverID}/action/${ConnectionID}/true`,Data)
        AwaitingActionCompletion = actionAdd["actionID"];
        console.log(actionAdd);
        console.log(Data);
    }
}

async function ActionButtonCancel(action) {
    if(action=="Kick"){
        document.getElementById('KickWindow').style.display = "none";
        document.getElementById('ModerationOverlay').hidden = true;
    }
    if(action=="Ban"){
        document.getElementById('BanWindow').style.display = "none";
        document.getElementById('ModerationOverlay').hidden = true;
    }
}

  function gameInfoButton(){
    const newUrl = `${window.location.origin}/games/GameInformation`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

async function setDate(Element) {
    const today = new Date();

    // Add one day to the current date
    today.setDate(today.getDate() + 1);
    Element.value = today.toISOString().split('T')[0];
}

async function MenuButtonPress(menu,action) {
    if(menu == "Ban"){
        document.getElementById('BanWindow').querySelector('#TimeStamp').style.display = "none";
        document.getElementById('BanWindow').querySelector('#BanAfter').style.display = "none";
        document.getElementById('BanWindow').querySelector('#PermaBan').style.display = "none";
        SelectedBanLength = action;
        if(action == "TimeStamp"){
            document.getElementById('BanWindow').querySelector('#TimeStamp').style.display = null;
            MenuItemChanged("Ban",document.getElementById('BanWindow').querySelector('#TimeStamp'),document.getElementById('BanWindow').querySelector('#TimeStamp').value);
        }
        if(action == "After"){
            document.getElementById('BanWindow').querySelector('#BanAfter').style.display = null;
            MenuItemChanged("Ban",document.getElementById('BanWindow').querySelector('#BanNumberSelector'),document.getElementById('BanWindow').querySelector('#BanNumberSelector').value);
        }
        if(action == "Never"){
            document.getElementById('BanWindow').querySelector('#PermaBan').style.display = null;
            MenuItemChanged("Ban",document.getElementById('BanWindow').querySelector('#PermaBan'),document.getElementById('BanWindow').querySelector('#PermaBan').value);
        }
    }
}

async function MenuItemChanged(menu,item,value) {
    if(menu == "Ban"){
        if(value == null && item.id != "PermaBan"){
            document.getElementById('BanWindow').querySelector('#ConfirmBanButton').disabled = true;
            document.getElementById('BanWindow').querySelector('#ConfirmBanButton').style.backgroundColor = "grey";
        }
        if(item.id == "TimeStamp"){
            const currentTimestamp = Date.now();
            const selectedDate = new Date(value);
            if(selectedDate < currentTimestamp){
                document.getElementById('BanWindow').querySelector('#ConfirmBanButton').disabled = true;
                document.getElementById('BanWindow').querySelector('#ConfirmBanButton').style.backgroundColor = "grey";
            }else{
                document.getElementById('BanWindow').querySelector('#ConfirmBanButton').disabled = null;
                document.getElementById('BanWindow').querySelector('#ConfirmBanButton').style.backgroundColor = "darkred";
            }
        }
        if(item.id == "NumberSelector"){
            if(value != null && value != 0){
                document.getElementById('BanWindow').querySelector('#ConfirmBanButton').disabled = null;
                document.getElementById('BanWindow').querySelector('#ConfirmBanButton').style.backgroundColor = "darkred";
            }else{
                document.getElementById('BanWindow').querySelector('#ConfirmBanButton').disabled = true;
                document.getElementById('BanWindow').querySelector('#ConfirmBanButton').style.backgroundColor = "grey";
            }
        }
    }
}


function serversButton(){
    const newUrl = `${window.location.origin}/`;
    console.log('Redirecting to:', newUrl);

    // Redirect
    window.location.href = newUrl;
}

function backButton(){
    const newUrl = `${window.location.origin}/Server`;
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
    setDate(document.getElementById('BanWindow').querySelector('#TimeStamp'));
}
