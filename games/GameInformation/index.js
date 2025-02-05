const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);
var apiService = "https://api.envistmakes.com/"
var gameID = getCookie("SelectedGame")
var ConnectKey = null;
var HiddenKey = "10238021843095743995rn894375329847329874239874x92by948327b984328749327412";
var Shown = false;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

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

function gamesButton(){
    const newUrl = `${window.location.origin}/games/`;
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

function ToggleKeyVisibility(element){
    if(Shown){
        element.textContent = "Show"
        document.getElementById("ConnectKey").style.filter = "blur(10px)";
        document.getElementById("ConnectKey").textContent = HiddenKey;
    }else{
        element.textContent = "Hide"
        document.getElementById("ConnectKey").style.filter = "";
        document.getElementById("ConnectKey").textContent = ConnectKey;
    }
    Shown = !Shown;
}


async function onLoad(){
    ConnectKey = (await getRequest(apiService+`games/${gameID}/ConnectionKey/${getCookie("webtoken")}`))["key"]
}