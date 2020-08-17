const easelApp = require('../app');
const assert = require('assert').strict;

describe('app', () => {
  it('should connect the series of points if the last and first one are close together', () => {
    const points = [
      [
        {x: 0, y: 0 },
        {x: 1, y: 0 },
        {x: 1, y: 1 },
        {x: 0, y: 1 },
        {x: 0.00001, y: 0.00001 },
      ]
    ];
    const sortedPoints = easelApp.sortPoints(points);

    assert.deepEqual(sortedPoints[0][0], sortedPoints[0][sortedPoints[0].length - 1]);
  });

  it('should leave far apart points alone', () => {
    const points = [
      [
        {x: 0, y: 0 },
        {x: 1, y: 0 },
        {x: 1, y: 1 },
        {x: 0, y: 1 },
      ]
    ];
    const sortedPoints = easelApp.sortPoints(points);

    assert.notDeepEqual(sortedPoints[0][0], sortedPoints[0][sortedPoints[0].length - 1]);
  });
});
