'use strict';

const fs = require('fs');
const dxf = require('dxf');

const parsed = dxf.parseString(
  fs.readFileSync(
    './node_modules/dxf/test/resources/circlesellipsesarcs.dxf', 'utf-8'
  )
);

// Open this SVG in your browser or other SVG viewer
const svg = dxf.toSVG(parsed);

fs.writeFileSync(__dirname + '/example.svg', svg, 'utf-8');
