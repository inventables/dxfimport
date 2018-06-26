self.EaselLambdaApp = (function() {
  var AWS_ACCESS_KEY = "...",
      SECRET_ACCESS_KEY = "...",
      LAMBDA_REGION = "us-east-1";

  var invoke = function(properties, lambdaName, lambdaSfx) {
    if (lambdaSfx) {
      lambdaName += ":" + lambdaSfx
    }

    return new Promise(function(resolve, reject) {
      new AWS.Lambda({
        region: LAMBDA_REGION,
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: SECRET_ACCESS_KEY
      }).invoke({
        FunctionName: lambdaName,
        Payload: JSON.stringify(properties)
      }, function(err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(result.Payload))
        }
      })
    })
  }

  return { invoke: invoke }
}())
