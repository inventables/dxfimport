var AWS_ACCESS_KEY = "[ACCESS_KEY]",
    SECRET_ACCESS_KEY = "[SECRET]",
    LAMBDA_REGION = "us-east-1",
    LAMBDA_NAME = "dxfimport",
    LAMBDA_QUALIFIER = "base";

var properties = [
  {id: "DXF File", type: "file-input"}
];

var executor = function(params, success, failure) {
  params = params[0];
  if (!params["DXF File"]) {
    return failure("Please upload a DXF file on the left to begin.");
  }
  
  var request = new AWS.Lambda({
    region: LAMBDA_REGION,
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    maxRetries: 3
  }).invoke({
    FunctionName: LAMBDA_NAME,
    Qualifier: LAMBDA_QUALIFIER,
    Payload: JSON.stringify({'url': params["DXF File"]})
  }, function(err, result) {
    if (err) {
      console.error(err)
      failure("DXF import failed: " + err + ". Try re-uploading the file or refreshing your browser.");
    } else {
      var payload = JSON.parse(result.Payload);
      if (payload.errorMessage || !payload.svg) {
        var errorMessage = payload.errorMessage;
        if (errorMessage.match('delegate')) {
          errorMessage = "Cannot read file";
        }
        failure("DXF import failed: " + errorMessage);
      } else {
        var svg = payload.svg;
        var fillColor = "#666";
        var strokeColor = "none";
        
        svg = svg.replace('fill="#000000"', 'fill="' + fillColor + '"')
          .replace('stroke="none"', 'stroke="' + strokeColor + '" stroke-width="5"');
        
        success(svg);
      }
    }
  });
};

