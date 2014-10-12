'use strict';

var
  bodyParser = require('body-parser'),
  express = require('express'),
  iCalendar = require('./lib/icalendar');


var event1 = {
  "@id": "http://calendar.bergnet.org/2014-09-03-11-00#event",
  "startDate": "2014-09-03T11:00:00+02:00",
  "endDate": "2014-09-03T12:00:00+02:00",
  "description": "Test",
  "location": "Landshut"
};

var event2 = {
  "@id": "http://calendar.bergnet.org/2014-09-05-21-00#event",
  "startDate": "2014-09-05T21:00:00Z",
  "endDate": "2014-09-05T23:00:00Z",
  "description": "Test",
  "location": "Weng",
  "attendee": [
    {"@id": "https://www.bergnet.org/people/bergi/card#me"},
    {"@id": "https://www.bergnet.org/people/bergi/card#otherme"} ]
};


var
  app = express(),
  calendar = new iCalendar.ICalendar();

calendar.on('event:added', function (event) {
  console.log('event:added');
  console.log(event.toJSON());
});

calendar.on('event:updated', function (event) {
  console.log('event:updated');
  console.log(event.toJSON());
});

calendar.on('event:removed', function (event) {
  console.log('event:removed');
  console.log(event.toJSON());
});

app.use(require('morgan')('dev'));
app.use(bodyParser.raw({type: 'text/calendar'}));
app.use('/calendar', calendar.middleware);

calendar.addEvent(event1);
calendar.addEvent(event2);

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
