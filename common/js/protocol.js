// protocol

(
  function(exports)
  {
    exports.PackageType =
    {
      MESSAGE:      0,
      JOIN:         2,
      LEAVE:        3,
      USERLIST:     4,
      ERROR:        5,
      REQUEST:      6,
      UPDATE:       7
    };
    
    exports.createMessagePackage = function(message)
    {
      return {type: exports.PackageType.MESSAGE, message: message};
    };
    
    exports.createErrorPackage = function(detail)
    {
      return {type: exports.PackageType.ERROR, detail: detail};
    };
    
    exports.createRequestPackage = function(content)
    {
      return {type: exports.PackageType.REQUEST, content: content};
    };
    
    exports.createUpdatePackage = function(content)
    {
      return {type: exports.PackageType.UPDATE, content: content};
    };
  }
)(typeof exports === "undefined" ? this["protocol"] = {}: exports);

{
  
}
