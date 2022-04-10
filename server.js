
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const sio = require('socket.io');
//const favicon = require('serve-favicon');
//const compression = require('compression');
const cors = require('cors');

const app = express()
  // options = { 
  //   //key: fs.readFileSync(__dirname + '/rtc-video-room-key.pem'),
  //   //cert: fs.readFileSync(__dirname + '/rtc-video-room-cert.pem')
  // }
  
  app.use(cors());
  const port = process.env.PORT || 3000
  // server = process.env.NODE_ENV === 'production' ?
  //   http.createServer(app).listen(port) :
  //   https.createServer(options, app).listen(port),

  app.options('/*', (req, res) => {
    console.log("request: ", req.originalUrl);
    res.sendStatus(200);
    
});

  // app.use((req, res, next) => {
  //   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Origin, X-Requested-With, Content-Type, Accept"
  //   );
  //   console.log("request: ", req);
  //   next();
  // });

  
  
  const httpServer = http.createServer(app).listen(port);
  
  const io = sio(httpServer, {cors: {origin: "http://localhost:3001", allowedHeaders: ["my-custom-header"], credentials: true}});
  // const io = sio(httpServer, {
  //   cors: {
  //     origin: "http://localhost:3001"
  //   }
  // });
  //io.origins(['http://localhost:3000', '*']);
  

  // io = sio(server, {
  // });

  

  
  

  console.log("server started: ");
// compress all requests

//app.use(compression());
//app.use(express.static(path.join(__dirname, 'dist')));
//app.use((req, res) => res.sendFile(__dirname + '/dist/index.html'));
//app.use(favicon('./dist/favicon.ico'));
// Switch off the default 'X-Powered-By: Express' header
app.disable('x-powered-by');
io.sockets.on('connection', socket => {
  console.log("====connected!!!!: ");
  let room = '';
  // sending to all clients in the room (channel) except sender
  socket.on('message', message => socket.broadcast.to(room).emit('message', message));
  socket.on('find', () => {
    const url = socket.request.headers.referer.split('/');
    //room = url[url.length - 1];
    room = socket.request.headers['my-custom-header'];
    console.log("URL & Room: ", socket.request.headers.referer, room, io.sockets.adapter.rooms.get(room));
    const sr = io.sockets.adapter.rooms.get(room);
    if (sr === undefined) {
      // no room with such name is found so create it
      socket.join(room);
      socket.emit('create');
    } else if (sr.size < 10) {
      socket.emit('join');

      // copied from functions below

      data.sid = socket.id;
      // sending to all clients in the room (channel) except sender
      socket.broadcast.to(room).emit('approve', data);
      io.sockets.connected[id].join(room);
      // sending to all clients in 'game' room(channel), include sender
      io.in(room).emit('bridge');

    } else { // max 10 clients
      socket.emit('full', room);
    }
  });
  socket.on('auth', data => {
    data.sid = socket.id;
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('approve', data);
  });
  socket.on('accept', id => {
    io.sockets.connected[id].join(room);
    // sending to all clients in 'game' room(channel), include sender
    io.in(room).emit('bridge');
  });
  socket.on('reject', () => socket.emit('full'));
  socket.on('leave', () => {
    // sending to all clients in the room (channel) except sender
    socket.broadcast.to(room).emit('hangup');
    socket.leave(room);});
});

