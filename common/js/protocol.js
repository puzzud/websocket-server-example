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
      return {TYPE: exports.PackageType.MESSAGE, MESSAGE: message};
    };
    
    exports.createErrorPackage = function(detail)
    {
      return {TYPE: exports.PackageType.ERROR, DETAIL: detail};
    };
    
    exports.createRequestPackage = function(infoId)
    {
      return {TYPE: exports.PackageType.REQUEST, INFO_ID: infoId};
    };
    
    exports.createUpdatePackage = function(content)
    {
      return {TYPE: exports.PackageType.UPDATE, CONTENT: content};
    };
  }
)(typeof exports === "undefined" ? this["protocol"] = {}: exports);

{
  
}
