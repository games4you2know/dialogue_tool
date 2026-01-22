const WebSocket = require('ws');
const map = new Map();
const server = require('y-websocket/bin/utils.js').setupWSConnection;
const wss = new WebSocket.Server({ port: 1234 });

wss.on('connection', (conn, req) => {
  server(conn, req, { gc:true });
});
console.log('y-websocket server running on 1234');
