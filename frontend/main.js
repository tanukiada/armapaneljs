const jwt = localStorage.getItem('token');

function checkAuthorized() {
    if(!jwt) {
        window.location.href = 'frontend/public/login.html';
    }
}

async function getStatus() {
    try {
        let response = await fetch('https://tanuki.gay/api/v1/service/status', {
            credentials: 'include'
        })
        let data = response.json();
        while (data.Status !== 'Online') {
            setTimeout(getStatus, 5000);
            document.querySelector('#data-container').innerHTML = "Server Status: Offline";
        }
        document.querySelector('#data-container').innerHTML = "Server Status: Online";
    } catch (err) {
        console.error('Error fetching data: ', err.message);
    }
}

async function changeState(status) {
    getStatus();
    try{
        const response = await fetch('https://tanuki.gay/api/v1/service/status', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: status })
        })
        if (!response.ok) {
            console.error('Failed to get response. Please report to your local ada.');
        }
        return response.json();
    } catch (err) {
        console.error('Fetch Error: ', err.message);
    }
}

async function login(event) {
    const form = document.querySelector('#login_form');
    event.preventDefault();
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData.entries());
    const jsonString = JSON.stringify(dataObject);
    try {
        let response = await fetch('https://tanuki.gay/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonString,
            credentials: 'include'
        })
        if (!response.ok) {
            document.querySelector('#errorHandler').innerHTML = "Contact your local server tanuki with the following info: " + response.status;
        }
        window.location.href = "../app/index.html";
    } catch (err) {
        console.error("Could not log you in: ", err.message);
    }
}