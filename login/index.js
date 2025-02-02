const url = window.location.href;
const params = new URLSearchParams(new URL(url).search);
var apiService = "https://api.envistmakes.com/"

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



async function onLoad() {
    console.log("Version 1")
    if(params.get("code") != null){
        console.log(apiService+ "profile/"+params.get("code")+"/register");
        const verifing = await getRequest(apiService+ "profile/"+params.get("code")+"/register")
        console.log(verifing);
        if(verifing["verified"]){
            document.cookie = "token="+verifing["token"]+"; Path=/; Secure; SameSite=true"
            document.cookie = "information="+JSON.stringify(verifing["token-resources"])+"; Path=/; Secure; SameSite=true"
            document.cookie = "webtoken="+verifing["token"]+"; Path=/; Secure; SameSite=true"
            document.cookie = "userinformation="+verifing["userInformation"]+"; Path=/; Secure; SameSite=true"
            const newUrl = `${window.location.origin}/games`;
            console.log('Redirecting to:', newUrl);
            window.location.href = newUrl;
        }else{
            document.getElementById("serverError").hidden = false;
            document.getElementById("serverError").querySelector('#ErrorMessage').textContent = "Invaild code";
        }
    }else{
        window.location.href = "https://authorize.roblox.com/?client_id=1027663679860863056&response_type=code&redirect_uri=https%3A%2F%2Fsecurity.envistmakes.com%2Flogin&scope=openid+profile+asset%3Aread+group%3Aread+universe:write&step=accountConfirm";
    }

}