var WS = {};

WS.Client = function()
{
  var address = "";//"localhost:8080";
  address = window.location.href;
  address = address.replace("https", "ws");
  address = address.replace("http", "ws");
  //address += "ws";
  
  this.ws = new WebSocket(address);
  this.ws.onload = this.onload.bind(this);
  this.ws.onmessage = this.onmessage.bind(this);
  this.ws.onclose = this.onclose.bind(this);
  
  var requestButton = document.getElementById("Request Button");
  if(requestButton !== undefined)
  {
    requestButton.onclick = this.request.bind(this);
  }
};

WS.Client.prototype.onload = function()
{
  console.log("WS.Client::onload.");
};

WS.Client.prototype.onmessage = function(event)
{
  this.processPackage(JSON.parse(event.data));
};
    
WS.Client.prototype.onclose = function()
{
  console.log("WS.Client::onclose.");
};

WS.Client.prototype.processPackage = function(package)
{
  var type = package.type;
  
  if(type === protocol.PackageType.MESSAGE)
  {
    return this.processMessagePackage(package);
  }
  
  if(type === protocol.PackageType.UPDATE)
  {
    return this.processUpdatePackage(package);
  }
};

WS.Client.prototype.sendPackage = function(package)
{
  this.ws.send(JSON.stringify(package));
};

WS.Client.prototype.request = function()
{
  var content = "jinx";
  
  var package = protocol.createRequestPackage(content);
  this.sendPackage(package);
  
  this.addLogMessage("Requesting: " + content);
};

WS.Client.prototype.processMessagePackage = function(package)
{
  this.addLogMessage(package.message);
};

WS.Client.prototype.processUpdatePackage = function(package)
{
  var avatarName = package.content.avatarName;
  
  var avatarImageElement = document.getElementById("Avatar Image");
  avatarImageElement.src = package.content.avatarImgSrc;
  
  var avatarNameElement = document.getElementById("Avatar Name");
  avatarNameElement.innerHTML = avatarName;
  
  this.addLogMessage("Recieved update for '" + avatarName + "'.");
};

WS.Client.prototype.addLogMessage = function(message)
{
  var logElement = document.getElementById("Log");
  
  var p = document.createElement("p");
  var textNode = document.createTextNode(message);
  
  p.appendChild(textNode);
  
  logElement.insertBefore(p, logElement.firstChild);
};

