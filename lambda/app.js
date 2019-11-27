'use strict';

var dxf = require('dxf'),
  request = require('request');

exports.handler = function (event, context) {
  const body = JSON.parse(event.body);

  request({ url: body.url, encoding: null }, function (error, response, body) {
    var dxfContents = body.toString();
    var units = determineUnits(dxfContents);
    var svgSTR = dxf.toSVG(dxf.parseString(dxfContents));
    svgSTR = svgSTR.replace("INSUNITS", units);
    svgSTR = svgSTR.replace("INSUNITS", units);
    context.done(null, { svg: svgSTR });
  });
};

function determineUnits(dxfContents) {
  var unitSVG = "INSUNITS";
  if (dxfContents.includes("$INSUNITS")) {
    var splitOnUnits = dxfContents.split("$INSUNITS");
    var splitOnNine = splitOnUnits[1].split("9");
    var splitOnSeventy = splitOnNine[0].split("70");
    var units = splitOnSeventy[1].replace(/(\r\n\t|\n|\r\t)/gm, "");
    var unit = parseInt(units);

    switch (unit) {
      case 1:
        unitSVG = "in"
        break;
      case 4:
        unitSVG = "mm"
        break;
      case 5:
        unitSVG = "cm"
        break;
      default:
        unitSVG = "INSUNITS"
    }
  }
  return unitSVG;
}
