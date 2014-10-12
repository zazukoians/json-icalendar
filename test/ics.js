var
  assert = require('assert'),
  fs = require('fs'),
  iCalendar = require('../lib/icalendar');


var toJSON = function (object) {
  if (typeof object === 'function') {
    return null;
  }

  if (typeof object === 'string') {
    return object;
  }

  if (Array.isArray(object)) {
    var array = [];

    for (var i=0; i<object.length; i++) {
      array.push(toJSON(object[i]));
    }

    return array;
  }

  if (typeof object === 'object') {
    var json = {};

    for (var key in object) {
      var value = toJSON(object[key]);

      if (value == null) {
        continue;
      }

      json[key] = value;
    }

    return json;
  }

  return null;
}


describe('iCalendar format', function () {
  var
    appleIcs,
    calendarIcs,
    googleIcs,
    simpleIcs,
    simple;

  before(function () {
    appleIcs = fs.readFileSync('./test/support/apple.ics').toString();
    calendarIcs = fs.readFileSync('./test/support/calendar.ics').toString();
    googleIcs = fs.readFileSync('./test/support/google.ics').toString();
    simpleIcs = fs.readFileSync('./test/support/simple.ics').toString();
    complexIcs = fs.readFileSync('./test/support/complex.ics').toString();
    simple = new iCalendar.Calendar();
    simpleEvent = new iCalendar.Event();
    simpleEvent.properties = {
      "SUMMARY": [ { "value": "summary", "attributes": {} } ],
      "LOCATION": [ { "value": "location", "attributes": {} } ],
      "DTSTART": [ { "value": "2014-09-11T06:00:00.000Z", "attributes": {} } ],
      "DTEND": [ { "value": "2014-09-11T06:30:00.000Z", "attributes": {} } ],
      "UID": [ { "value": "E06F3512-5065-476F-9A78-9471819EA40F", "attributes": {} } ]
    };
    simple.addChild(simpleEvent);
    complex = new iCalendar.Calendar();
    complexEvent = new iCalendar.Event();
    complexEvent.properties = {
      "UID": [ { "value": "99846c69-69bd-4603-863a-91496d429b25", "attributes": {} } ],
      "SUMMARY": [ { "value": "test", "attributes": {} } ],
      "ORGANIZER": [ { "value": "mailto:bergi@bergnet.org", "attributes": { "RSVP": "TRUE", "CN": "bergi", "PARTSTAT": "ACCEPTED", "ROLE": "CHAIR"} } ],
      "ATTENDEE": [
        { "value": "http://abc.com/#a", "attributes": { "RSVP": "TRUE", "PARTSTAT": "NEEDS-ACTION", "ROLE": "REQ-PARTICIPANT" } },
        { "value": "mailto:a@abc.com", "attributes": { "RSVP": "TRUE", "PARTSTAT": "NEEDS-ACTION", "ROLE": "REQ-PARTICIPANT" } } ],
      "DTSTART": [ { "value": "2014-09-28T07:00:00.000Z", "attributes": {} } ],
      "DTEND": [ { "value": "2014-09-28T07:30:00.000Z", "attributes": {} } ],
    };
    complex.addChild(complexEvent);
  });

  describe('parser', function () {
    it('should parse apple.ics', function () {
      var parsed = iCalendar.Component.fromString(appleIcs);

      assert(parsed.children.length, 2);
    });

    it('should parse calendar.ics', function () {
      var parsed = iCalendar.Component.fromString(calendarIcs);

      assert(parsed.children.length, 2);
    });

    it('should parse google.ics', function () {
      var parsed = iCalendar.Component.fromString(googleIcs);

      assert(parsed.children.length, 2);
    });

    it('should parse simple.ics', function () {
      var parsed = iCalendar.Component.fromString(simpleIcs);

      assert(parsed.children.length, 1);
    });

    it('should parse simple.ics to simple', function () {
      var parsed = iCalendar.Component.fromString(simpleIcs);

      assert.deepEqual(toJSON(parsed), toJSON(simple));
    });

    it('should parse complex.ics', function () {
      var parsed = iCalendar.Component.fromString(complexIcs);

      assert(parsed.children.length, 1);
    });

    it('should parse complex.ics to complex', function () {
      var parsed = iCalendar.Component.fromString(complexIcs);

      assert.deepEqual(toJSON(parsed), toJSON(complex));
    });
  });

  describe('serializer', function () {
    it('should serialize simple', function () {
      var serialized = simple.toString();

      assert(typeof serialized, 'string');
    });

    it('should serialize simple to simple.ics', function () {
      var serialized = simple.toString();

      assert(serialized, simpleIcs);
    });
  });
});