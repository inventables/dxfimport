/**
 * exports.handler called by lambda
 *
 * This is a normal node package - if you'd like to add packages you can just
 *
 * npm install -g <package-name>
 */
var dxf = require('dxf'),
    request = require('request');

exports.handler = function(event, context) {
  request({url: event['DXF File'], encoding: null}, function(error, response, body) {
    context.done(null, {svg: dxf.toSVG(dxf.parseString(body.toString()))});
  });
}
