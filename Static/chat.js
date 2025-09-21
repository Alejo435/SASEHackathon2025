window.addEventListener("DOMContentLoaded", () => {
    //========================= Socket & User Setup =========================
    const socket = io();
    let currentRoom = null; 
    let username = prompt("Enter your username:"); 

    //========================= DOM Elements =========================
    const messages = document.getElementById("messages"); 
    const input = document.getElementById("messageInput"); 
    const uploadBtn = document.getElementById("uploadBtn");
    const imageInput = document.getElementById("imageInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatContainer = document.getElementById("chat-container");
    const sunsetTimer = document.getElementById("sunsetTimer");

    //========================= Chat Room Functionality =========================
    function joinRoom(room) {
        if (currentRoom) socket.emit("leave", { username, room: currentRoom });

        currentRoom = room;
        socket.emit("join", { username, room });
        messages.innerHTML = "";
        chatContainer.style.display = "block";
        document.getElementById("home").style.display = "none";
    }

    function sendMessage() {
        const msg = input.value;
        if (msg.trim() !== "") {
            socket.emit("message", { username, msg, room: currentRoom });
            input.value = "";
        }
    }
    sendBtn.addEventListener("click", sendMessage);

    //========================= Receive Messages =========================
    socket.on("message", (msg) => {
        const bubble = document.createElement("div");
        bubble.classList.add("message-bubble", msg.startsWith(username + ":") ? "message-user" : "message-bot");
        bubble.textContent = msg;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    });

    socket.on("chat_history", (history) => {
        history.forEach(msg => {
            const bubble = document.createElement("div");
            bubble.classList.add("message-bubble", msg.startsWith(username + ":") ? "message-user" : "message-bot");
            bubble.textContent = msg;
            messages.appendChild(bubble);
        });
        messages.scrollTop = messages.scrollHeight;
    });

    //========================= Sunset Timer =========================
    socket.on("sunset_timer", (data) => {
        const seconds = data.seconds;
        if (seconds <= 0) {
            sunsetTimer.textContent = "Sunset is here! 🌅";
            document.querySelectorAll(".chat-image").forEach(img => img.style.filter = "none");
            return;
        }
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        sunsetTimer.textContent = `Sunset in: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    });

    //========================= Image Upload =========================
    uploadBtn.addEventListener("click", () => imageInput.click());

    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        const allowed = ["jpg","jpeg","png","gif","webp"];
        if (!allowed.includes(ext)) return alert("Only images allowed!");

        const reader = new FileReader();
        reader.onload = e => socket.emit("image", { username, room: currentRoom, imgData: e.target.result });
        reader.readAsDataURL(file);
    });

    socket.on("image", (data) => {
        const bubble = document.createElement("div");
        bubble.classList.add("message-bubble", data.username === username ? "message-user" : "message-bot");
        const img = document.createElement("img");
        img.src = data.imgData;
        img.style.maxWidth = "200px";
        img.style.borderRadius = "0.5rem";
        img.classList.add("chat-image");
        if (sunsetTimer.textContent !== "Sunset is here! 🌅") img.style.filter = "blur(5px)";
        bubble.appendChild(img);
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    });

    //========================= Switching Tabs =========================
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const isHome = tab.dataset.home === "true";
            const room = tab.dataset.room;

            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

            if (isHome) document.getElementById('home').style.display = 'block';
            else if (room) joinRoom(room);
        });
    });
});