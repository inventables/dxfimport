'use strict';

const dxf = require('dxf');
const Busboy = require('busboy');

const unitToken = "INSUNITS";

exports.handler = (event, context) => {
  const busboy = new Busboy({ headers: event.headers });

  busboy.on("file", (fieldName, file) => {
    file.on("data", data => {
      const dxfContents = data.toString("utf8");

      const outputSVG = dxf
        .toSVG(dxf.parseString(dxfContents))
        .replace(unitToken, determineUnits(dxfContents));

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
  });

  busboy.end(event.body);
};

function determineUnits(dxfContents) {
  if (dxfContents.includes(`$${unitToken}`)) {
    const splitOnUnits = dxfContents.split(`$${unitToken}`);
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

  return unitToken;
}
