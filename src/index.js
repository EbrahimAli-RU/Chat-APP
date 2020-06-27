const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const message = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils//users')
const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 8000
const publicDirectoryPath = path.join(__dirname, `../public`)

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {

    socket.on('join', ({ username, room}, callback) => {
        const { error, user} = addUser({ id: socket.id, username, room});
        if(error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', message.generateMessage('Admin', 'Wellcome'));
        socket.broadcast.to(user.room).emit('message', message.generateMessage('Admin', `${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })
    socket.on('sendmessage', (mess, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message',  message.generateMessage(user.username, mess))
        callback(`Delivered`);
    })

    socket.on('sendlocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', message.generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        
        if(user) {
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            io.to(user.room).emit('message', message.generateMessage(`${user.username} has left!`));
        }
            
        
    })

})
server.listen(8000, () => {
    console.log(`Listening on port 8000`);
})