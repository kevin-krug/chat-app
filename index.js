// not specifying any URL when I call io(), since it defaults to trying to connect to the host that serves the page.
let webSocket = new WebSocket("ws://localhost:3000");
webSocket.onopen = () => console.log('FE connection opened')
webSocket.onmessage = (event, isBinary) => {
    const message = isBinary ? event.data : event.data.toString()
    addMessages(message);
}


document.getElementById("send").addEventListener("click", () => {
    sendMessage({
        // name: document.getElementById("name").value,
        message: document.getElementById("message").value
    });
})
getMessages()


function addMessages(message) {
    const messagesDiv = document.getElementById("messages")
    const messageFragment = document.createDocumentFragment();
    const listItem = document.createElement("li");
    // const nameNode = Object.assign(document.createElement("p"), {textContent: message.name})
    const messageNode = Object.assign(document.createElement("p"), {textContent: message })

    messageFragment.appendChild(listItem);
    // listItem.appendChild(nameNode);
    listItem.appendChild(messageNode);
    messagesDiv.appendChild(messageFragment);
}

function getMessages() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", 'http://localhost:3000/messages', true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
            if (xmlhttp.status == 200) {
                JSON.parse(xmlhttp.responseText).forEach(addMessages);
            }
            else if (xmlhttp.status == 400) {
                alert('There was an error 400');
            }
            else {
                alert('something else other than 200 was returned');
            }
        }
    };
}

function sendMessage(message) {
    webSocket.send(message.message);
    addMessages(message.message);
}
