'use strict';

var dxf = require('dxf'),
    request = require('request');

exports.handler = function(event, context) {
  request({url: event.url, encoding: null}, function(error, response, body) {
    context.done(null, {svg: dxf.toSVG(dxf.parseString(body))});
  });
};

