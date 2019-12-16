var properties = function (projectSettings) {
  return [
    { id: "DXF File", type: "file-input", mimeTypes: [".dxf"] },
    { type: 'list', id: "Lines Mode", value: "Joined", options: ["Separate", "Joined"] }
  ];
};

// gateway name and API key are in AWS Lambda _Configuration_ tab, under _API Gateway layer
var apiGatewayName = "...";
var apiKey = ",,,";

// The SVG returned by the DXF to SVG library contains tags that aren't handled by Easel.
// This function filters out those tags.

function filterSVG(svg) {
  var tmp, result;

  result = svg.split('>');
  tmp = result.splice(0, 2);

  tmp.push(result.join(''));


  if (tmp.length >= 3) {
    svg = tmp[2];
  }

  var reg = /#[^\/]*stroke/gi;
  svg = svg.replace(reg, '');
  svg = svg.replace(/<path fill=\"none\" stroke=\"#000000\" stroke-width=\"0.1%\"/g, "");
  svg = svg.replace(/<path fill=\"none\" stroke=\"-width=\"0.1%\"/g, "");
  svg = svg.replace(/\//g, "");
  svg = svg.replace(/\\n/g, '');
  svg = svg.replace(/ /g, '');
  svg = svg.replace(/<svg/g, '');

  return svg;
}

// sortPoints joins line segments that are connected into one segment.

function sortPoints(points) {
  var diff = 0.0001;
  var first, last, firstCur, lastCur;
  for (var i = 0; i < points.length; i++) {
    first = points[i][0];
    last = points[i][points[i].length - 1];
    for (var j = i + 1; j < points.length; j++) {
      firstCur = points[j][0];
      lastCur = points[j][points[j].length - 1];
      if ((Math.abs(first.x - firstCur.x) < diff) && (Math.abs(first.y - firstCur.y) < diff)) {
        first = lastCur;
        points[i] = (points[j].reverse()).concat(points[i]);
        points.splice(j, 1);
        j = i;
        continue;
      }
      if ((Math.abs(first.x - lastCur.x) < diff) && (Math.abs(first.y - lastCur.y) < diff)) {
        first = firstCur;
        points[i] = points[j].concat(points[i]);
        points.splice(j, 1);
        j = i;
        continue;
      }
      if ((Math.abs(last.x - firstCur.x) < diff) && (Math.abs(last.y - firstCur.y) < diff)) {
        last = lastCur;
        points[i] = points[i].concat(points[j]);
        points.splice(j, 1);
        j = i;
        continue;
      }
      if ((Math.abs(last.x - lastCur.x) < diff) && (Math.abs(last.y - lastCur.y) < diff)) {
        last = firstCur;
        points[i] = points[i].concat(points[j].reverse());
        points.splice(j, 1);
        j = i;
        continue;
      }
    }
  }
  return points;
}


var executor = function (args, success, failure) {
  var params = args.params;
  if (!args.params['DXF File']) {
    return failure("Please upload a DXF file on the left to begin.");
  }

  fetch(apiGatewayName, {
    method: "POST",
    body: JSON.stringify({ url: args.params["DXF File"] }),
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "text/plain",
    }
  })
    .then(response => response.json())
    .then(function(response) {
      /**
       * The lambda app finshed! result contains the apps payload, parsed as JSON
       * The example app returns an svg as the only item in the map
       *
       * Since this is a "v1" app, we return SVG data
       */
      result = (typeof(response) == "string") ? JSON.parse(response) : response;

      /**
       * Process errors from inside of the Lambda app if returned payload has any
       */
      if ("errorMessage" in result) {
        failure(result.errorMessage);
      }

      if ("svg" in result) {
        var svg = result.svg;
        var fillColor = "#666";
        var strokeColor = "none";

        var unitsMM, unitsIN, devider;

        var volumes = [];

        svg = svg.replace(/INSUNITS/g, args.preferredUnit);
        svg = svg.replace('fill="#000000"', 'fill="' + fillColor + '"')
          .replace('stroke="none"', 'stroke="' + strokeColor + '" stroke-width="5"');

        unitsMM = svg.includes("mm\" height=");
        unitsIN = svg.includes("in\" height=");

        if (unitsMM) {
          devider = 25.4;
        } else {
          if (!unitsIN) {

          }
          devider = 1;
        }

        svg = filterSVG(svg);

        var newDataVolume = EASEL.pathUtils.fromSvgPathDataString(svg);
        newDataVolume.cut = {
          type: "outline",
          outlineStyle: "outside",
          tabPreference: false,
          depth: args.material.dimensions.z
        };

        // The devider fixes METRIC - IMPERIAL issues
        newDataVolume.shape.width = newDataVolume.shape.width / devider;
        newDataVolume.shape.height = newDataVolume.shape.height / devider;
        newDataVolume.shape.center.x = newDataVolume.shape.width / 2;
        newDataVolume.shape.center.y = newDataVolume.shape.height / 2;
        newDataVolume.shape.flipping.vertical = true;
        newDataVolume.shape.tabPreference = true;
        newDataVolume.shape.points = sortPoints(newDataVolume.shape.points);

        var testVolume = EASEL.pathUtils.fromPointArrays(newDataVolume.shape.points);
        testVolume.cut = {
          type: "outline",
          outlineStyle: "on-path",
          tabPreference: false,
          depth: args.material.dimensions.z
        };

        if (params["Lines Mode"] == "Joined") {
          testVolume.cut = {
            type: "outline",
            outlineStyle: "on-path",
            tabPreference: false,
            depth: args.material.dimensions.z
          };
          for (var i = 0; i < newDataVolume.shape.points.length; i++) {
            testVolume = EASEL.pathUtils.fromPointArrays([newDataVolume.shape.points[i]]);
            testVolume.cut = {
              type: "outline",
              outlineStyle: "on-path",
              tabPreference: false,
              depth: args.material.dimensions.z
            };
            volumes.push(testVolume);
          }
          var x = EASEL.volumeHelper.boundingBoxLeft(volumes);
          var y = EASEL.volumeHelper.boundingBoxBottom(volumes);
          var boundingBox = EASEL.volumeHelper.boundingBox(volumes)

          for (i = 0; i < volumes.length; i++) {
            volumes[i].shape.center.x = (volumes[i].shape.center.x - x) / devider;
            volumes[i].shape.center.y = (volumes[i].shape.center.y - y) / devider;
            volumes[i].shape.width = volumes[i].shape.width / devider;
            volumes[i].shape.height = volumes[i].shape.height / devider;
            volumes[i].shape.flipping.vertical = true;
            volumes[i].shape.tabPreference = true;
          }
          var boundingBox = EASEL.volumeHelper.boundingBox(volumes);
          for (i = 0; i < volumes.length; i++) {
            volumes[i].shape.center.y = boundingBox.height - volumes[i].shape.center.y;
          }
        } else {
          volumes.push(newDataVolume);
        }

        success(volumes);
      } else {
        console.warn('Missing svg data', result);
        failure('Could not parse the returned data.');
      }
    })
    .catch(function(err) {
      // There was some general Lambda errors when calling the API
      failure(err)
    });
};
