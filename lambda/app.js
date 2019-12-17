'use strict';

const dxf = require('dxf');
const request = require('request');

exports.handler = (event, context) => {
  const body = JSON.parse(event.body);

  request({ url: body.url, encoding: null }, (error, response, body) => {
    const dxfContents = body.toString();

    const outputSVG = dxf
      .toSVG(dxf.parseString(dxfContents))
      .replace("INSUNITS", determineUnits(dxfContents));

    context.done(
      null,
      {
        isBase64Encoded: false,
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ "svg": outputSVG })
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

    switch (parseInt(units)) {
      case 1:
        return "in";
      case 4:
        return "mm";
      case 5:
        return "cm";
    }
  }

  return unitSVG;
}
