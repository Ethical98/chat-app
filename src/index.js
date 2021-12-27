import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { generateMessage, generateLocationMessage } from './utils/messages.js';
import Filter from 'bad-words';
import { addUser, getUser, getUsersInRoom, removeUser } from './utils/users.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

const __dirname = path.resolve();

//Paths for Express config
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

io.on('connection', (socket) => {
  console.log('New Web Socket Connection');

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit('message', generateMessage('ChatApp', 'Welcome'));
    socket
      .to(user.room)
      .emit('message', generateMessage('ChatApp', `${user.username} Joined`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('messageSent', (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }
    if (user) {
      io.to(user.room).emit('message', generateMessage(user.username, message));
      callback();
    }
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user[0].room).emit(
        'message',
        generateMessage('ChatApp', `${user[0].username} has Left`)
      );
      io.to(user[0].room).emit('roomData', {
        room: user[0].room,
        users: getUsersInRoom(user[0].room),
      });
    }
  });

  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'locationMessage',
        generateLocationMessage(
          user.username,
          `https://www.google.com/maps?q=${location.lat},${location.long}`
        )
      );
      callback();
    }
  });
});

server.listen(port, () => {
  console.log('Server is running');
});
