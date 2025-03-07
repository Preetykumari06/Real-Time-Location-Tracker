const express = require('express');
const app = express();
const http = require('http');
const path = require('path');

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", function(socket) {
  console.log(`User connected: ${socket.id}`);

  // When a user sends location
  socket.on("send-location", function(data) {
    users[socket.id] = { id: socket.id, ...data };
    io.emit("receive-location", users[socket.id]); // Send to everyone
  });

  socket.on("disconnect", function() {
    console.log(`User disconnected: ${socket.id}`);
    delete users[socket.id];
    io.emit("user-disconnected", socket.id);
  });
});

app.get('/', (req, res) => {
  res.render("index");
});

// Start the server
const PORT = 3500;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
