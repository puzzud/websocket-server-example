// Implemented using:
// https://github.com/websockets/ws

var protocol = require("../common/js/protocol");

//var url = require("url");
var path = require("path");
var express = require("express");
var app = express();
var http = require("http");
var server = http.Server(app);
var websocket = require("ws");

var ConnectedClients = [];
var ClientIdCounter = 0;

var wsServer = new websocket.Server({server});

wsServer.on
(
  "connection",
  function(ws)
  {
    //var location = url.parse(ws.upgradeReq.url, true);
    
    ws.on
    (
      "message",
      function(data)
      {
        var pkg = JSON.parse(data);
        var type = pkg["TYPE"];
        
        if(type === protocol.PackageType.MESSAGE)
        {
          wsServer.processMessagePackage(pkg);
        }
        else if(type === protocol.PackageType.REQUEST)
        {
          wsServer.processRequestPackage(pkg);
        }
        else
        {
          wsServer.sendPackage(ws, protocol.createErrorPackage("unknown message type"));
        }
      }
    );
    
    ws.on
    (
      "close",
      function()
      {
        var pkg = protocol.createMessagePackage("Someone disconnected.");
        wsServer.broadcastPackage(pkg);
        //console.log("Client " + ws.client.id + " disconnected.");
      }
    );
    
    var pkg = protocol.createMessagePackage("Client connected.");
    wsServer.sendPackage(ws, pkg);
  }
);

wsServer.sendPackage = function(ws, pkg)
{
  ws.send(JSON.stringify(pkg));
};

wsServer.broadcastPackage = function(pkg)
{
  var packageString = JSON.stringify(pkg);
  
  wsServer.clients.forEach
  (
    function each(client)
    {
      if(client.readyState === websocket.OPEN)
      {
        client.send(packageString);
      }
    }
  );
};

wsServer.processMessagePackage = function(pkg)
{
  wsServer.broadcastPackage(protocol.createErrorPackage(pkg["MESSAGE"]));
};

wsServer.processRequestPackage = function(pkg)
{
  var avatarName = "";
  var avatarImageSource = "";
  
  var infoId = pkg["INFO_ID"]; 
  if(infoId === "jinx")
  {
    avatarImageSource = "http://orig00.deviantart.net/1eaf/f/2013/284/0/7/jinx___splat_7_by_etruzion-d6q1jes.png";
    avatarName = "Jinx";
  }
        
  var pkg = protocol.createUpdatePackage(avatarName, avatarImageSource);
  wsServer.broadcastPackage(pkg);
};

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
