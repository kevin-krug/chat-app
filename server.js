const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URI;

const Redis = require('ioredis');
const redisClient = new Redis();

const app = express(); // init express app function handler
const http = require('http');
const server = http.createServer(app); // supply app to HTTP server 


const webSocketServer = new WebSocket.WebSocketServer({server});

const getCachedMessages = socket => {
  redisClient.lrange("messages", 0, -1, (error, data) => {

    data.map(message => {
      socket.send(message)
    })
  })
}

webSocketServer.on('connection', function connection(ws) {
  
  console.log('a user joined');

  getCachedMessages(ws);

  ws.on('message', async function incoming(data, isBinary= true) {

    const payload = isBinary ? data : data.toString();

    try {
      await redisClient.rpush("messages", [payload]); // store in redis as strinigified json
    } catch (error) {
      console.error(error);
    }

    webSocketServer.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(payload), { binary: isBinary };
      }
    })

  })

  ws.on('disconnect', () => {
    console.log('a user left');
  });

})

app.use(express.static(__dirname + '/'));

mongoose.connect(dbUrl, (err) => {
  console.log('mongodb connected', err);
}).catch(error => console.error(error));

var Message = mongoose.model('Message', { name: String, message: String });

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  })
})

app.post('/messages', (req, res) => {
  var message = new Message(req.body);

  message.save((err) => {
    if (err) {
      res.sendStatus(500);
    }
    webSocketServer.emit('message', req.body);
    res.sendStatus(200);
  })
})

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  console.log(__dirname);
});

 