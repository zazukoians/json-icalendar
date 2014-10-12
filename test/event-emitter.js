/*var
  assert = require('assert'),
  bodyParser = require('body-parser'),
  express = require('express'),
  fs = require('fs'),
  iCalendar = require('../lib/icalendar'),
  request = require('supertest');


var initApp = function () {
  var
    app = express(),
    calendar = new iCalendar.ICalendar();

  app.use(bodyParser.raw({type: 'text/calendar'}));
  app.use('/calendar', calendar.middleware);

  return {
    app: app,
    calendar: calendar
  };
};


describe('iCalendar', function () {
  describe('event:added', function () {
    it('should ', function (done) {
      var
        context = initApp(),
        eventUuids = { 'E06F3512-5065-476F-9A78-9471819EA40F': true };

      context.calendar.on('event:added', function (event) {
        console.log(event);

        if (event.sameAs in eventUuids) {
          delete[eventUuids[event.sameAs]];
        }
      });

      request(context.app)
        .post('/calendar')
        .send(fs.readFileSync(__dirname + '/support/simple.ics'))
        .end(function (err, res) {
          setTimeout(function () {
            if (Object.keys(eventUuids).length !== 0) {
              return done('event:added event not emitted');
            }

            done();
          }, 5000);
        });
    });
  });
});*/