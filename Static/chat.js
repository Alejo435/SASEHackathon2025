

const socket = io();
let currentRoom = null;
let username = prompt("Enter your username:"); //this is what we gotta find a way to change with login name

//====================================================Chat room functionality======================================

const messages = document.getElementById("messages"); 
//getElementId looks through html to find elements with the attribute
const input = document.getElementById("messageInput"); 


// Join a room
function joinRoom(room) {
  if (currentRoom) {
    socket.emit("leave", { username, room: currentRoom });
  }

  currentRoom = room;
  socket.emit("join", { username, room }); //event JS sneds to be used in Flask API
  document.getElementById("messages").innerHTML = ""; // clear old chat
}



//function to send messages from your computer
function sendMessage() {
  const msg = input.value;
  if (msg.trim() !== "") {
    socket.emit("message", { username, msg }); 
    //TODO rn frontend fine like this, but when we add selector must change to
    //socket.emit("message", { username, msg, room: "sports" }); for example
    input.value = "";
  }
}

// Receive messages
socket.on("message", (msg) => {
  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble"); //gets CSS formating

  if (msg.startsWith(username + ":")) {
    bubble.classList.add("message-user");
  } else {
    bubble.classList.add("message-bot");
  }

  bubble.textContent = msg;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
});


//for retreiving past chat history
socket.on("chat_history", (history) => {
  history.forEach((msg) => addMessage(msg));
});

//function to create message bubbles from past messages
function addMessage(msg) {
  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");

  // Always add either user or bot class
  if (msg && msg.startsWith(username + ":")) {
    bubble.classList.add("message-user");
  } else {
    bubble.classList.add("message-bot");
  }

  bubble.textContent = msg;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  

}


//====================================================Sunset timer functionality======================================

// Listen for sunset timer updates from server
socket.on("sunset_timer", (data) => {
    const secondsRemaining = data.seconds;

    if (secondsRemaining <= 0) {
        document.getElementById("sunsetTimer").textContent = "Sunset is here! 🌅";
        return;
    }

    const h = Math.floor(secondsRemaining / 3600);
    const m = Math.floor((secondsRemaining % 3600) / 60);
    const s = secondsRemaining % 60;

    document.getElementById("sunsetTimer").textContent =
        `Sunset in: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
});