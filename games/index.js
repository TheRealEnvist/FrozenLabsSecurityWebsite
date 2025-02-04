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

async function generateGameProfiles() {
    const information = JSON.parse(getCookie("information"))
    const Resources = information["resource_infos"]
    Resources.forEach(async (data, index, array) => {
        if(data["resources"]["universe"] != null){
            data["resources"]["universe"]["ids"].forEach(async (data, index, array) => {
                const GameCard = document.getElementById('RobloxGameContainer').cloneNode(true)
                const Information = await getRequest(`${apiService}universe/${data}/information`)
                var MediaLink;
                if(Information["Media"]["data"][0] != null){
                    MediaLink = await getRequest(`${apiService}thumbnails/${Information["Media"]["data"][0]["imageId"]}/`)
                    if(MediaLink["Media"]["data"][0]["imageUrl"] != null){
                        GameCard.querySelector("#RobloxGameImage").style.backgroundImage = "url("+MediaLink["Media"]["data"][0]["imageUrl"]+"})";
                    }
                }
                GameCard.querySelector(".RobloxGameTitle").querySelector("#Message").textContent = Information["RootPlace"]["data"][0]["sourceName"];
                GameCard.querySelector(".RobloxGameDescription").querySelector("#Message").textContent = Information["RootPlace"]["data"][0]["sourceDescription"];
                GameCard.style.display = "";
                GameCard.addEventListener('click', function() {
                    document.cookie = "SelectedGame="+Information["RootPlace"]["data"][0]["rootPlaceId"]+"; Path=/; Secure; SameSite=true"
                    const newUrl = `${window.location.origin}/index.html`;
                    console.log('Redirecting to:', newUrl);
                    window.location.href = newUrl;
                });
                document.getElementById("MainContentContainer").appendChild(GameCard);
            });
        }
    });

}

async function onLoad(){
    if(getCookie("token") == null || getCookie("information") == null){
        const newUrl = `${window.location.origin}/login`;
        console.log('Redirecting to:', newUrl);
        window.location.href = newUrl;
    }else{
        generateGameProfiles()
    }
}