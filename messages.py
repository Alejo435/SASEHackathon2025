from flask import Flask, render_template, request
import threading, time
#  socetio adds WebSocket support for flask (two way messages)
from flask_socketio import SocketIO, SocketIO, join_room, leave_room, send, emit

messages = Flask(__name__)
messages.config['SECRET_KEY'] = 'your_secret'
socketio = SocketIO(messages)

#temporary message storing solution
chat_history = {}  # { "room_name": [ "user: message", ... ] }

sunset_times = {
    "general": 0.5 * 60,
    "sports": 5 * 60,
    "music": 8 * 60
}


#================================================Sunset Countdown==================================================
def countdown_task():
    """Background task to decrement sunset timers."""
    while True:
        socketio.sleep(1)  
        for room in list(sunset_times.keys()):
            if sunset_times[room] > 0:
                sunset_times[room] -= 1

            # Emit to everyone in this room
            socketio.emit("sunset_timer", {"room": room, "seconds": sunset_times[room]}, to=room)


# Start background thread
socketio.start_background_task(countdown_task)

@messages.route('/')
def index():
    return render_template('chat-menu.html')


#====================================================Socket/JS Integration===========================================
@socketio.on('join')
def on_join(data): 
    #data is what JS sends, in this case "message" is event name and {username, room} is object
    #provides info to allow API to do certain function like join, leave, etc...
    username = data['username']
    room = data['room']
    join_room(room)

    # Notify the room that a new user joined
    send(f"{username} has entered the room {room}", to=room, include_self=False)
    # Ensure room exists in chat history
    if room not in chat_history:
        chat_history[room] = []

    seconds = sunset_times.get(room, 0)
    emit("sunset_timer", {"room": room, "seconds": seconds})

    



@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send(f"{username} has left the room {room}", to=room)



@socketio.on('message')
def handle_message(data):
    username = data['username']
    msg = data['msg']

    # use provided room if available, otherwise default
    room = data.get('room', 'general')

    formatted_msg = f"{username}: {msg}"

    #save message in history
    if room not in chat_history:
        chat_history[room] = []
    chat_history[room].append(formatted_msg)

    #send message to everyone in room
    send(formatted_msg, to=room)




#for testing with out chat selector
@socketio.on('connect')
def on_connect(room = None):
    if room:
        join_room(room)
    else:
        room = "general"  #default room
        join_room(room)

    #ensure room exists in history
    if room not in chat_history:
        chat_history[room] = []

    #send existing chat history only to the new member
    emit("chat_history", chat_history[room])



    

#==============================================running API===================================================
if __name__ == '__main__':
    socketio.run(messages, debug=True)