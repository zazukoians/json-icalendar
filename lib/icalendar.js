'use strict';

var
  moment = require('moment-timezone'),
  Calendar = require('./calendar'),
  Component = require('./component'),
  Event = require('./event'),
  EventEmitter = require('events').EventEmitter;


var ICalendar = function (options) {
  var
    self = this,
    calendar = new Calendar();

  if (options == null) {
    options = {};
  }

  if (!('cleanEvents' in options)) {
    options.cleanEvents = true;
  }

  this.addEvent = function (event) {
    var vEvent = Event.fromJSON(event);

    calendar.addChild(vEvent);

    self.emit('event:added', vEvent);
  };

  this.middleware = function (req, res, next) {
    if (req.method === 'GET') {
      var body = calendar.toString();

      res.send(body);
    } else if (req.method === 'PUT') {
      var
        body = req.body.toString(),
        newCalendar = Component.fromString(body),
        oldEvents;

      // convert all timestamps to UTC
      newCalendar.normalize();

      // create map of old events with uuid as keys
      oldEvents = calendar.events().reduce(function (events, event) {
        events[event.uuid()] = event;

        return events;
      }, {});

      // copy new calender properties
      calendar.properties = newCalendar.properties;

      // start with empty child list
      calendar.children = [];

      // and add new ones
      newCalendar.children.forEach(function (child) {
        calendar.children.push(child);

        // event handling for event objects
        if (child.type === Event.type) {
          var
            uuid = child.uuid(),
            simplified = Event.fromJSON(child.toJSON());

          if (uuid in oldEvents) {
            // copy existing URL
            child['@id'] = oldEvents[uuid]['@id'];

            // to and from JSON to remove unkown properties
            var simplifiedOld = Event.fromJSON(oldEvents[uuid].toJSON());

            if (!simplifiedOld.equals(simplified)) {
              self.emit('event:updated', child);
            }

            delete oldEvents[uuid];
          } else {
            self.emit('event:added', child);
          }

          // replace event with simplified version
          if (options.cleanEvents) {
            var index = calendar.children.length - 1;

            calendar.children[index] = simplified;
          }
        }
      });

      // old events still in the list are removed
      for (var uuid in oldEvents) {
        self.emit('event:removed', oldEvents[uuid]);
      };

      res.sendStatus(204);
    } else {
      next();
    }
  };
};

ICalendar.prototype = new EventEmitter();


module.exports = {
  Component: Component,
  Calendar: Calendar,
  Event: Event,
  ICalendar: ICalendar
};