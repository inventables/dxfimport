'use strict';

const dxf = require('dxf');
const request = require('request');

exports.handler = function (event, context) {
  const body = JSON.parse(event.body);

  request({ url: body.url, encoding: null }, function (error, response, body) {
    const dxfContents = body.toString();
    const units = determineUnits(dxfContents);
    const svgSTR = dxf
      .toSVG(dxf.parseString(dxfContents))
      .replace("INSUNITS", units);

    context.done(
      null,
      {
        isBase64Encoded: false,
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ "svg": svgSTR })
      }
    );
  });
};

function determineUnits(dxfContents) {
  let unitSVG = "INSUNITS";

  if (dxfContents.includes("$INSUNITS")) {
    const splitOnUnits = dxfContents.split("$INSUNITS");
    const splitOnNine = splitOnUnits[1].split("9");
    const splitOnSeventy = splitOnNine[0].split("70");
    const units = splitOnSeventy[1].replace(/(\r\n\t|\n|\r\t)/gm, "");
    const unit = parseInt(units);

    switch (unit) {
      case 1:
        unitSVG = "in";
        break;
      case 4:
        unitSVG = "mm";
        break;
      case 5:
        unitSVG = "cm";
        break;
      default:
        unitSVG = "INSUNITS"
    }
  }

  return unitSVG;
}
