var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const WebSocket = require('ws');

var dbUrl = '';

const PORT = process.env.PORT || 3000;

const Redis = require('ioredis');
const redisClient = new Redis();

var app = express();
var http = require('http');
//  express initializes app to be a function handler that you can supply to an HTTP server 
var server = http.createServer(app);

const webSocketServer = new WebSocket.WebSocketServer({server});

const getCachedMessages = socket => {
  redisClient.lrange("messages", 0, -1, (error, data) => {
    data.map(message => {
      socket.send(message)
    })
  })
}


webSocketServer.on('connection', function connection(ws) {
  
  getCachedMessages(ws);

  ws.on('message', async function incoming(data, isBinary= true) {
    console.log(data)
    const message = isBinary ? data : data.toString();
    // user:message
    try {
      const result = await redisClient.rpush("messages", [`${message}`]);
      console.log(result);
      } catch (error) {
          console.error(error);
      }
    webSocketServer.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message), { binary: isBinary };
      }
    })
  })
})

// webSocketServer.on('connection', (webSocket) =>{
//   console.log('a user is connected')
//   webSocket.on('message', (data) => {
//     debugger
//     console.log('message received')
//     for ( client of webSocketServer.clients ) {
//       client.readyState === WebSocket.OPEN &&
//         client.send(data)
//     }
//    });
//   webSocket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
// })

app.use(express.static(__dirname));

// app.use(bodyParser.json());

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

// app.get('/', (req, res) => {
//     res.send('Hello World!')
//   })
 