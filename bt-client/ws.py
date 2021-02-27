import socketio

# standard Python
sio = socketio.Client()

@sio.event
def message(data):
    print('I received a message!')

@sio.on('my message')
def on_message(data):
    print('I received a message!')

sio.connect('http://localhost:5000')
print('my sid is', sio.sid)
sio.emit('my message', {'foo': 'bar'})