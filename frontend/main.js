const jwt = localStorage.getItem('token');

async function getStatus() {
    let response = await fetch('https://tanuki.gay/api/v1/service/status', {
        headers: {
            "Authorization": "Bearer " + jwt
        }
    })
        .then(response => {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector("#data-container").append( data.status );
        })
        .catch(error => console.error('Error fetching data:', error));
}

async function changeState(status) {
    let = response = await fetch('https://tanuki.gay/api/v1/service/status', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(status)
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

async function login() {
    const form = document.querySelector('#login_form');
    form.preventDefault();
    const formData = new formData(form.target);
    const dataObject = Object.fromEntries(formData.entries());
    const jsonString = json.stringify(dataObject);
    await fetch('https://tanuki.gay/api/v1/service/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonString
        })
        .then(response => {
            if(!response.ok) {
                document.querySelector('#errorHandler').innerHTML = "Contact your local server tanuki with the following info: " + response.status;
            }
        })
        .then(response => response.json())
        .then(data => localStorage.setItem('token', data.token))
        .then(window.location.href = "../app/index.html")
        .catch((error) => console.error('Error: ', error));
}