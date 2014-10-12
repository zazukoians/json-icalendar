'use strict';

var
  moment = require('moment-timezone'),
  uuid = require('uuid'),
  Component = require('./component');


var Event = function (iri) {
  this.parent = {
    addProperty: this.addProperty.bind(this),
    updateProperty: this.updateProperty.bind(this),
    propertyToString: this.propertyToString.bind(this)
  };

  this.init(Event.type, iri);

  this.addDateProperty = function (name, value, attributes) {
    var timezone = null;

    if (attributes != null && 'TZID' in attributes) {
      timezone = attributes.TZID;

      delete attributes.TZID;
    }

    this.parent.addProperty(name, Component.utils.date.fromVDate(value, timezone), attributes);
  };

  this.addProperty = function (name, value, attributes) {
    if (attributes == null) {
      attributes = {};
    }

    if (Event.dateProperties.indexOf(name) >= 0) {
      this.addDateProperty(name, value, attributes);
    } else {
      this.parent.addProperty(name, value, attributes);
    }
  };

  this.datePropertyToString = function (name, index) {
    var
      property = this.properties[name][index],
      string = '';

    string += name;

    for (var attribute in property.attributes) {
      string += ';' + attribute + '=' + property.attributes[attribute];
    }

    string += ':' + moment.utc(property.value).format('YYYYMMDDTHHmm00') + 'Z\n';

    return string;
  };

  this.propertyToString = function (name, index) {
    if (Event.dateProperties.indexOf(name) >= 0) {
      return this.datePropertyToString(name, index)
    }

    return this.parent.propertyToString(name, index);
  };

  this.uuid = function (uuid) {
    if (uuid != null) {
      this.updateProperty('UID', uuid);
    }

    return this.getPropertyValuesCompact('UID');
  };

  this.startDate = function (startDate) {
    if (startDate != null) {
      this.parent.updateProperty('DTSTART', startDate);
    }

    return this.getPropertyValuesCompact('DTSTART');
  };

  this.endDate = function (endDate) {
    if (endDate != null ) {
      this.parent.updateProperty('DTEND', endDate);
    }

    return this.getPropertyValuesCompact('DTEND');
  };

  this.summary = function (summary) {
    if (summary != null) {
      this.updateProperty('SUMMARY', summary);
    }

    return this.getPropertyValuesCompact('SUMMARY');
  };

  this.location = function (location) {
    if (location != null) {
      this.updateProperty('LOCATION', location);
    }

    return this.getPropertyValuesCompact('LOCATION');
  };

  this.attendee = function (attendee) {
    if (attendee != null) {
      this.updateProperty('', attendee);
    }

    return this.getPropertyValuesCompact('ATTENDEE')
  };

  this.toJSON = function () {
    var
      self = this,
      json = {
        '@context': 'http://schema.org',
        '@id': this['@id'],
        '@type': 'Event'
      };

    if (self.uuid() != null) {
      json.sameAs = self.uuid();
    }

    if (self.startDate() != null) {
      json.startDate = self.startDate();
    }

    if (self.endDate() != null) {
      json.endDate = self.endDate();
    }

    if (self.summary() != null) {
      json.description = self.summary();
    }

    if (self.location() != null) {
      json.location = self.location();
    }

    if (self.attendee() != null) {
      json.attendee = self.attendee();
    }

    return json;
  };
};

Event.prototype = new Component();

Event.type = 'VEVENT';

Component.classes[Event.type] = Event;

Event.dateProperties = [
  'DTSTART',
  'DTEND'
];

Event.fromJSON = function (json) {
  var event = new Event(json['@id']);

  if (!('sameAs' in json)) {
    event.uuid(uuid());
  } else {
    event.uuid(json.sameAs);
  }

  if ('startDate' in json) {
    event.startDate(json.startDate);
  }

  if ('endDate' in json) {
    event.endDate(json.endDate);
  }

  if ('description' in json) {
    event.summary(json.description);
  }

  if ('location' in json) {
    event.location(json.location);
  }

  if ('attendee' in json) {
    event.attendee(json.attendee);
  }

  return event;
};

module.exports = Event;