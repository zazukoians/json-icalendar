'use strict';

var
  _ = require('underscore'),
  equal = require('deep-equal'),
  moment = require('moment-timezone');


var Tokenizer = function (string, separator) {
  this.string = string;
  this.separator = separator;
  this.index = 0;

  this.next = function () {
    var
      offset,
      next;

    offset = this.string.indexOf(this.separator, this.index);

    if (offset >= 0) {
      next = this.string.substr(this.index, offset - this.index);
    } else {
      next = this.string.substr(this.index);
      offset = this.string.length;
    }

    this.index = offset + this.separator.length;

    return next;
  };

  this.hasNext = function () {
    return this.index < this.string.length;
  };

  this.rest = function () {
    var rest = this.string.substr(this.index);

    this.index = this.string.length + this.separator.length;

    return rest;
  };
}

var Component = function (type, iri) {
  /**
   * Set component type, IRI and init properties, child list
   * @param type
   * @param iri
   */
  this.init = function (type, iri) {
    this['@id'] = iri;
    this.type = type;
    this.properties = {};
    this.children = [];
  };

  this.init(type, iri);

  /**
   * Add a property / property value including attributes
   * @param name
   * @param value
   * @param attributes
   */
  this.addProperty = function (name, value, attributes) {
    if (attributes == null) {
      attributes = {};
    }

    if (!(name in this.properties)) {
      this.properties[name] = [];
    }

    this.properties[name].push({
      value: value,
      attributes: Component.utils.normalizeObject(attributes)
    });
  };

  /**
   * Update a property value and/or attributes
   * @param name
   * @param value
   * @param attributes
   * @param index
   */
  this.updateProperty = function (name, value, attributes, index) {
    if (!(name in this.properties)) {
      return this.addProperty(name, value, attributes);
    }

    if (index == null) {
      index = 0;
    }

    if (value != null) {
      this.properties[name][index].value = value;
    }

    if (attributes != null) {
      this.properties[name][index].attributes = Component.utils.normalizeObject(attributes);
    }
  };

  /**
   * Remove property / property value
   * @param name
   * @param index
   */
  this.removeProperty = function (name, index) {
    if (index == null) {
      index = 0;
    }

    this.properties[name].splice(index, 1);

    if (this.properties[name].length === 0) {
      delete this.properties[name];
    }
  };

  /**
   * Get list of values for the given property
   * @param name
   * @returns {*}
   */
  this.getPropertyValues = function (name) {
    if (!(name in this.properties)) {
      return [];
    }

    return this.properties[name].map(function (property) {
      return property.value;
    });
  };

  /**
   * Get null, simple or array values of property
   * @param name
   * @returns {*}
   */
  this.getPropertyValuesCompact = function (name) {
    var values = this.getPropertyValues(name);

    if (values.length === 0) {
      return null
    }

    if (values.length === 1) {
      return values[0];
    }

    return values;
  };

  /**
   * Get the first value for the given property
   * @param name
   * @returns {*}
   */
  this.getPropertyValue = function (name) {
    return this.getPropertyValues(name).shift();
  };

  /**
   * Add a child component
   * @param child
   */
  this.addChild = function (child) {
    this.children.push(child);
  };

  /**
   * Remove a child component
   * @param child
   */
  this.removeChild = function (child) {
    var index = this.children.indexOf(child);

    if (index < 0) {
      return;
    }

    this.children.splice(index, 1);
  };

  /**
   * Compare componet with another one
   * @param other
   * @returns {*}
   */
  this.equals = function (other) {
    var
      thisProperties = Component.utils.normalizeObject(this.properties),
      otherProperties = Component.utils.normalizeObject(other.properties);

    if (this.type !== other.type) {
      return false;
    }

    if (this['@id'] !== other['@id']) {
      return false;
    }

    if (!equal(thisProperties, otherProperties)) {
      return false;
    }

    if (this.children.length !== other.children.length) {
      return false;
    }

    for (var i=0; i<this.children.length; i++) {
      if (!this.children[i].equals(other.children[i])) {
        return false;
      }
    }

    return true;
  };

  /**
   * Create a iCalendar string for a property
   * @param name
   * @param index
   * @returns {string}
   */
  this.propertyToString = function (name, index) {
    var
      property = this.properties[name][index],
      string = '';

    string += name;

    for (var attribute in property.attributes) {
      string += ';' + attribute + '=' + property.attributes[attribute];
    }

    string += ':' + property.value + '\n';

    return string;
  };

  /**
   * Create a iCalendar string for the component
   * @returns {string}
   */
  this.toString = function () {
    var string = '';

    string += 'BEGIN:' + this.type + '\n';

    for (var name in this.properties) {
      for (var index=0; index<this.properties[name].length; index++) {
        string += this.propertyToString(name, index);
      }
    };

    this.children.forEach(function (child) {
      string += child.toString();
    })

    string += 'END:' + this.type + '\n';

    return string;
  };
};

/**
 * Map of constructors for specific component types
 * @type {{}}
 */
Component.classes = {};

/**
 * Create a Component object from a iCalendar string
 * @param string
 * @returns {*}
 */
Component.fromString = function (string) {
  var
    root = null,
    stack = [];

  var parseBegin = function (type) {
    var child;

    // create a known object from classes or generic Component
    if (type in Component.classes) {
      child = new Component.classes[type]();
    } else {
      child = new Component(type);
    }


    if (stack.length === 0) {
      // if stack is empty child is the root
      root = child;
    } else {
      // otherwise add child to the children list
      stack[0].addChild(child);
    }

    // push child to the stack
    stack.unshift(child);
  };

  var parseEnd = function () {
    // remove component from stack
    stack.shift();
  };

  var parseField = function (key, value) {
    var
      keyTokenizer = new Tokenizer(key, ';'),
      attributes = {};

    key = keyTokenizer.next();

    while(keyTokenizer.hasNext()) {
      var
        attributeTokenizer = new Tokenizer(keyTokenizer.next(), '='),
        attributeKey = attributeTokenizer.next(),
        attributeValue = attributeTokenizer.next();

      attributes[attributeKey] = attributeValue;
    };

    stack[0].addProperty(key, value, attributes);
  };

  var parseLine = function (line) {
    var
      lineTokenizer = new Tokenizer(line, ':'),
      key = lineTokenizer.next(),
      value = lineTokenizer.rest();

    if (key === 'BEGIN') {
      parseBegin(value);
    } else if (key === 'END') {
      parseEnd();
    } else {
      parseField(key, value);
    }
  };

  // convert multiline properties
  string = string.replace(/\r\n /g, '');

  string.split('\r\n').forEach(function (line) {
    if (line !== '') {
      parseLine(line);
    }
  });

  return root;
};

Component.utils = {
  date: {}
};

/**
 * Normalize an object (sort properties)
 * @param object
 * @returns {*}
 */
Component.utils.normalizeObject = function (object) {
  return _.object(
    _.pairs(object)
      .sort(function (a, b) {
        if (a < b) {
          return -1;
        } else {
          return 1;
        }
      })
    );
};

/**
 * Convert a ISO date string to a ISO date string with UTC timezone
 * @param date
 * @returns {string}
 */
Component.utils.date.toUTC = function (date) {
  return new Date(new Date(date).toUTCString()).toISOString();
}

/**
 * Convert a iCalendar date string to a ISO string
 * @param vDate
 * @param timezone
 * @returns {*|string}
 */
Component.utils.date.fromVDate = function (vDate, timezone) {
  var date = moment.utc(vDate, 'YYYYMMDDTHHmm00');

  if (timezone != null) {
    date = moment.tz(date, timezone);
  }

  return date.toISOString();
};

/**
 * Convert a ISO date string + timezone to a ISO date string with UTC timezone
 * @param isoDate
 * @param timezone
 * @returns {*|string}
 */
Component.utils.date.fromISODate = function (isoDate, timezone) {
  var date = moment.utc(new Date(isoDate).toISOString().substr(0, 22));

  if (timezone != null) {
    date = moment.tz(date, timezone);
  }

  return date.toISOString();
};


module.exports = Component;