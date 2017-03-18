var WS = {};

WS.Client = function()
{
  var address = "localhost:8080";
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
  console.log("WS onload.");
};

WS.Client.prototype.onmessage = function(event)
{
  this.processPackage(JSON.parse(event.data));
  
  console.log("WS onmessage.");
};
    
WS.Client.prototype.onclose = function()
{
  console.log("WS onclose.");
};

WS.Client.prototype.processPackage = function(pkg)
{
  var type = pkg["TYPE"];
  
  if(type === protocol.PackageType.MESSAGE)
  {
    var message = pkg["MESSAGE"];
    this.addLogMessage("Recieved message: " + message);
    
    return;
  }
  
  if(type === protocol.PackageType.UPDATE)
  {
    return this.processUpdatePackage(pkg);
  }
};

WS.Client.prototype.request = function()
{
  var infoId = "jinx";
  
  var pkg = protocol.createRequestPackage(infoId);
  this.ws.send(JSON.stringify(pkg));
  
  this.addLogMessage("Requesting: " + infoId);
};

WS.Client.prototype.processUpdatePackage = function(pkg)
{
  var avatarName = pkg["AVATAR_NAME"];
  
  var avatarImageElement = document.getElementById("Avatar Image");
  avatarImageElement.src = pkg["AVATAR_IMG_SRC"];
  
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
