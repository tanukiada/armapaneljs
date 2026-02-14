const jwt = localStorage.getItem('token');

if(!jwt) {
        window.location.href = 'frontend/login/login.html';
}

function getStatus() {
    fetch('https://tanuki.gay/api/v1/service/status', {
        credentials: 'include'
    })
        .then(response => {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            return response.json()
        })
        .then(data => {
            if (data.status !== 'Online') {
                setTimeout(getStatus, 5000);
            }
            document.querySelector("#data-container").append( data.status );
        })
        .catch(error => console.error('Error fetching data: ', error));
}

function changeState(status) {
    fetch('https://tanuki.gay/api/v1/service/status', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({status: status})
    })
        .then(response => {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        })
        .then(response => {
            if(!response.ok) {
                return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was an error with the PUT request: ', error);
        });
}

function login(event) {
    const form = document.querySelector('#login_form');
    event.preventDefault();
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData.entries());
    const jsonString = JSON.stringify(dataObject);
    fetch('https://tanuki.gay/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonString,
        credentials: 'include'
        })
        .then(response => {
            if(!response.ok) {
                document.querySelector('#errorHandler').innerHTML = "Contact your local server tanuki with the following info: " + response.status;
                throw new Error("Login failed");
            }
            return response.json();
        })
        .then(() => {window.location.href = "../app/index.html"})
        .catch((error) => console.error('Error: ', error));
}