/**
 * This is just an example property
 * More info here: http://developer.easel.com/#properties
 */
var properties = [
  {id: "DXF File", type: "file-input"}
];

/**
 * Name of the lambda function to execute
 */
var name = "dxfimport2";

/**
 * By default we use the "base" revision for the given lambda
 * function but you can customize it here
 */
var version = "current";

var executor = function(args, success, failure) {
  /**
   * This is a v1 app so we just select the first parameter (the list is always just one element)
   */
  var params = args[0];

  /**
   * EaselLambdaApp is provided by the generator script automatically.
   *
   * EaselLambdaApp.invoke takes the current params and returns a promise
   * that completes when the lambda call is finished
   */
  EaselLambdaApp
    .invoke(params, name, version)
    .then(function(result) {
      /**
       * The lambda app finshed! result contains the apps payload, parsed as JSON
       * The example app returns an svg as the only item in the map
       *
       * Since this is a "v1" app, we return SVG data
       */
      success(result.svg)
    })
    .catch(function(err) {
      // There was some lambda error
      failure(err)
    })
};
