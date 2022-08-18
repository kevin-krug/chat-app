const user = new URLSearchParams(window.location.search).get('user');

let webSocket = new WebSocket("ws://localhost:3000");

webSocket.onopen = () => console.log('FE connection opened')

webSocket.onmessage = (event, isBinary) => {
    const payload = isBinary ? event.data : event.data.toString();
    const { user, message } = JSON.parse(payload);

    addMessage({user, message});
}

document.getElementById("send").addEventListener("click", () => {
    sendMessage({
        user,
        message: document.getElementById("message").value
    });
})

getChatHistory()

function addMessage({user, message}) {
    const messagesDiv = document.getElementById("messages")
    const messageFragment = document.createDocumentFragment();
    const listItem = document.createElement("li");
    const userNode = Object.assign(document.createElement("b"), {textContent: user})
    const messageNode = Object.assign(document.createElement("p"), {textContent: message })

    messageFragment.appendChild(listItem);
    listItem.appendChild(userNode);
    listItem.appendChild(messageNode);
    messagesDiv.appendChild(messageFragment);
}

function getChatHistory() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", 'http://localhost:3000/messages', true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
            if (xmlhttp.status == 200) {
                JSON.parse(xmlhttp.responseText).forEach(addMessage);
            }
            else if (xmlhttp.status == 400) {
                alert('There was an error 400');
            }
            else {
                alert(`status ${xmlhttp.status} was returned`);
            }
        }
    };
}

function sendMessage({user, message}) {
    webSocket.send(JSON.stringify({user, message})); // serialize
    addMessage({user, message});
}
