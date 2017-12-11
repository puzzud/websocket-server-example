// Implemented using:
// https://github.com/websockets/ws

var protocol = require("../common/js/protocol");

//var url = require("url");
var path = require("path");
var express = require("express");
var app = express();
var http = require("http");
var server = http.Server(app);

var WS = {};

WS.Server = function(server)
{
  this.connectedClients = [];
  this.clientIdCounter = 0;

  WebSocket = require("ws"); // NOTE: Purposely global.
  
  this.wss = new WebSocket.Server({server});
  this.wss.on("connection", this.onconnection.bind(this));
};

WS.Server.prototype.onconnection = function(ws)
{
  var wsSocket = new WS.Socket(ws, this);
  
  var package = protocol.createMessagePackage("Client " + wsSocket.clientId + " connected.");
  wsServer.broadcastPackage(package, wsSocket);
};

WS.Server.prototype.sendPackage = function(ws, package)
{
  ws.send(JSON.stringify(package));
};

WS.Server.prototype.broadcastPackage = function(package, allBut)
{
  allBut = (allBut === undefined) ? null : allBut.ws;
  
  var packageString = JSON.stringify(package);
  
  this.wss.clients.forEach
  (
    function each(client)
    {
      if(client !== allBut)
      {
        if(client.readyState === WebSocket.OPEN)
        {
          client.send(packageString);
        }
      }
    }
  );
};

WS.Server.prototype.processPackage = function(package, wsSocket)
{
  var type = package.type;
  
  if(type === protocol.PackageType.MESSAGE)
  {
    wsServer.processMessagePackage(package, wsSocket);
  }
  else if(type === protocol.PackageType.REQUEST)
  {
    wsServer.processRequestPackage(package, wsSocket);
  }
  else
  {
    wsServer.sendPackage(wsSocket.ws, protocol.createErrorPackage("unknown message type"));
  }
};

WS.Server.prototype.processMessagePackage = function(package, wsSocket)
{
  this.broadcastPackage(protocol.createErrorPackage(package.message));
};

WS.Server.prototype.processRequestPackage = function(package, wsSocket)
{
  var avatarName = "";
  var avatarImageSource = "";
  
  var content = package.content; 
  if(content === "jinx")
  {
    avatarImageSource = "http://orig00.deviantart.net/1eaf/f/2013/284/0/7/jinx___splat_7_by_etruzion-d6q1jes.png";
    avatarName = "Jinx";
  }
  
  var content =
  {
    avatarName: avatarName,
    avatarImgSrc: avatarImageSource
  };
  
  var package = protocol.createUpdatePackage(content);
  this.broadcastPackage(package);
};

WS.Socket = function(ws, wsServer)
{
  this.ws = ws;
  this.wsServer = wsServer;
  this.clientId = ++wsServer.clientIdCounter;
  
  //var location = url.parse(ws.upgradeReq.url, true);
  
  ws.on("message", this.onmessage.bind(this));
  ws.on("close", this.onclose.bind(this));
  
  wsServer.connectedClients.push(this);
  
  var package = protocol.createMessagePackage("Connected as client " + this.clientId + ".");
  wsServer.sendPackage(ws, package);
};

WS.Socket.prototype.onmessage = function(data)
{
  var package = JSON.parse(data);
  this.wsServer.processPackage(package, this);
};

WS.Socket.prototype.onclose = function()
{
  var wsServer = this.wsServer;
  var index = wsServer.connectedClients.indexOf(this);
  if(index > -1)
  {
    wsServer.connectedClients = wsServer.connectedClients.splice(index, 1);
    
    var package = protocol.createMessagePackage("Client " + this.clientId + " disconnected.");
    wsServer.broadcastPackage(package, this);
  }
};

var wsServer = new WS.Server(server);

// Set up static website.
var commonPath = path.resolve(__dirname + "/../common");
var clientPath = path.resolve(__dirname + "/../client");
var indexHtmlPath = path.resolve(clientPath + "/index.html");

app.get
(
  "/",
  function(req, res)
  { 
    res.sendFile(indexHtmlPath);
  }
);

var jsPath = path.resolve(clientPath + "/js");
app.use("/js", express.static(jsPath));

var commonJsPath = path.resolve(commonPath + "/js");
app.use("/js/protocol.js", express.static(commonJsPath + "/protocol.js"));

var cssPath = path.resolve(clientPath + "/css");
app.use("/css", express.static(cssPath));

var port = 8080;

if(process.argv.length > 2)
{
  port = parseInt(process.argv[2]);
}

server.listen(port);
