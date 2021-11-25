var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var dbUrl = '';

var app = express();
var http = require('http');
//  express initializes app to be a function handler that you can supply to an HTTP server 
var server = http.createServer(app);
const { Server } = require('socket.io');
// initialize a new instance of socket.io by passing the server (the HTTP server) object
var io =  new Server(server);

io.on('connection', (socket) =>{
  console.log('a user is connected')
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

app.use(express.static(__dirname));

app.use(bodyParser.json());

mongoose.connect(dbUrl, (err) => {
  console.log('mongodb connected', err);
})

var Message = mongoose.model('Message', { name: String, message: String });

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  })
})

app.post('/messages', (req, res) => {
  console.log('request', req);
  console.log('request body', req.body);
  var message = new Message(req.body);

  console.log('server message', message);
  message.save((err) => {
    if (err) {
      res.sendStatus(500);
    }
    io.emit('message', req.body);
    res.sendStatus(200);
  })
})

server.listen(3000, () => {
  console.log('server is running on port 3000');
  console.log(__dirname);
});

// app.get('/', (req, res) => {
//     res.send('Hello World!')
//   })
