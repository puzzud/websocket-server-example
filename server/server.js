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
  
  var pkg = protocol.createMessagePackage("Client " + wsSocket.clientId + " connected.");
  wsServer.broadcastPackage(pkg, wsSocket);
};

WS.Server.prototype.sendPackage = function(ws, pkg)
{
  ws.send(JSON.stringify(pkg));
};

WS.Server.prototype.broadcastPackage = function(pkg, allBut)
{
  allBut = (allBut === undefined) ? null : allBut.ws;
  
  var packageString = JSON.stringify(pkg);
  
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

WS.Server.prototype.processPackage = function(pkg, wsSocket)
{
  var type = pkg.TYPE;
  
  if(type === protocol.PackageType.MESSAGE)
  {
    wsServer.processMessagePackage(pkg, wsSocket);
  }
  else if(type === protocol.PackageType.REQUEST)
  {
    wsServer.processRequestPackage(pkg, wsSocket);
  }
  else
  {
    wsServer.sendPackage(wsSocket.ws, protocol.createErrorPackage("unknown message type"));
  }
};

WS.Server.prototype.processMessagePackage = function(pkg, wsSocket)
{
  this.broadcastPackage(protocol.createErrorPackage(pkg.MESSAGE));
};

WS.Server.prototype.processRequestPackage = function(pkg, wsSocket)
{
  var avatarName = "";
  var avatarImageSource = "";
  
  var infoId = pkg.INFO_ID; 
  if(infoId === "jinx")
  {
    avatarImageSource = "http://orig00.deviantart.net/1eaf/f/2013/284/0/7/jinx___splat_7_by_etruzion-d6q1jes.png";
    avatarName = "Jinx";
  }
        
  var pkg = protocol.createUpdatePackage(avatarName, avatarImageSource);
  this.broadcastPackage(pkg);
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
  
  var pkg = protocol.createMessagePackage("Connected as client " + this.clientId + ".");
  wsServer.sendPackage(ws, pkg);
};

WS.Socket.prototype.onmessage = function(data)
{
  var pkg = JSON.parse(data);
  this.wsServer.processPackage(pkg, this);
};

WS.Socket.prototype.onclose = function()
{
  var wsServer = this.wsServer;
  var index = wsServer.connectedClients.indexOf(this);
  if(index > -1)
  {
    wsServer.connectedClients = wsServer.connectedClients.splice(index, 1);
    
    var pkg = protocol.createMessagePackage("Client " + this.clientId + " disconnected.");
    wsServer.broadcastPackage(pkg, this);
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

server.listen(8080);
