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
    var timezone = this.getPropertyValue('X-WR-TIMEZONE');

    this.removeProperty('X-WR-TIMEZONE');

    if (timezone != null) {
      this.events().forEach(function (event) {
        var fixDate = function (name) {
          var date = event.getPropertyValue(name);

          date = Component.utils.date.fromISODate(date, timezone);

          event.updateProperty(name, date);
        }

        fixDate('DTSTART');
        fixDate('DTEND');
      });
    }
  };
};

Calendar.prototype = new Component();

Calendar.type = 'VCALENDAR';

Component.classes[Calendar.type] = Calendar;


module.exports = Calendar;