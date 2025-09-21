

const socket = io();
let currentRoom = null;
let username = prompt("Enter your username:"); //this is what we gotta find a way to change with login name
let remainingTime = 0;

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
    const roomToUse = currentRoom || "general";
    socket.emit("message", { username, msg, room: roomToUse });
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
    remainingTime = data.seconds; // keep track globally

    if (remainingTime <= 0) {
        document.getElementById("sunsetTimer").textContent = "Sunset is here! 🌅";

        // Unblur all images in chat
        document.querySelectorAll("#messages img.blurred").forEach(img => {
            img.classList.remove("blurred");
        });

        return;
    }

    const h = Math.floor(remainingTime / 3600);
    const m = Math.floor((remainingTime % 3600) / 60);
    const s = remainingTime % 60;

    document.getElementById("sunsetTimer").textContent =
        `Sunset in: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
});



//====================================================Image functionality======================================


window.onload = () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const imageInput = document.getElementById("imageInput");
  const roomToUse = currentRoom || "general"; 


uploadBtn.addEventListener("click", () => { //whenever user clicks uploadBTN this will run
  imageInput.click(); // open file picker
});

imageInput.addEventListener("change", (event) => { //change fires whenever user selects file in explorer
  console.log("File input change triggered"); 
  const file = event.target.files[0]; //grabs first file
  if (file) {
    console.log("File type:", file.type);
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const ext = file.name.split(".").pop().toLowerCase();

    if (allowedExtensions.includes(ext)) {
      const reader = new FileReader(); //FileReader is built in JS API to read selected files
      reader.onload = function(e) { //defines what happens after file is read (e.target.results will contain file conetent)
        // Send base64 image data to server
        socket.emit("image", { username, room: roomToUse, imgData: e.target.result });

      };
    
    reader.readAsDataURL(file); //starts reading file and when done base64 string sent to server
  }
    
  }
});

// ====== Receive images ======
socket.on("image", (data) => { //
  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");

  if (data.username === username) {
    bubble.classList.add("message-user");
  } else {
    bubble.classList.add("message-bot");
  }

  const img = document.createElement("img");
  img.src = data.imgData;
  img.style.maxWidth = "200px";
  img.style.borderRadius = "0.5rem";

  if (remainingTime > 0) {   // we'll define remainingTime below
    img.classList.add("blurred");
  }

  bubble.appendChild(img);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
});
}