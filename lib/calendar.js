'use strict';

var
  Component = require('./component'),
  Event = require('./event');


var Calendar = function () {
  var self = this;

  this.init(Calendar.type);

  this.events = function () {
    var events = [];

    this.children.forEach(function (child) {
      if (child.type === Event.type) {
        events.push(child);
      }
    });

    return events;
  };

  this.normalize = function () {
    this.events().forEach(function (event) {
      var fixDate = function (name) {
        // ignore unkown property
        if (!(name in event.properties)) {
          return;
        }

        var
          date = event.getPropertyValue(name),
          property = event.properties[name][0];

        if ('TZID' in property.attributes) {
          date = Component.utils.date.fromISODate(date, property.attributes['TZID']);

          event.updateProperty(name, date);

          delete property['TZID'];
        }
      };

      fixDate('DTSTART');
      fixDate('DTEND');
    });
  };
};

Calendar.prototype = new Component();

Calendar.type = 'VCALENDAR';

Component.classes[Calendar.type] = Calendar;


module.exports = Calendar;