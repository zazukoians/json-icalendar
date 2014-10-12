var
  assert = require('assert'),
  iCalendar = require('../lib/icalendar');


describe('components', function () {
  describe('Component', function () {
    it('should init type, properties and children', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      assert.equal(component['@id'], 'http://example.org', '@id not set');
      assert.equal(component.type, 'VABSTRACT', 'type not set');
      assert.equal(typeof component.properties, 'object', 'properties not set');
      assert.ok(Array.isArray(component.children), 'children not set');
    });

    it('should add a property with value and no attribute', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE');

      assert.deepEqual(component.properties, {
        PROPERTY: [{
         value: 'VALUE',
         attributes: {}
        }]
      });
    });

    it('should add a property with value and attribute', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE', {attribute: 'attributeValue'});

      assert.deepEqual(component.properties, {
        PROPERTY: [{
          value: 'VALUE',
          attributes: { attribute: 'attributeValue' }
        }]
      });
    });

    it('should add multiple property values with attributes', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE1', {attribute: 'attributeValue1'});
      component.addProperty('PROPERTY', 'VALUE2', {attribute: 'attributeValue2'});

      assert.deepEqual(component.properties, {
        PROPERTY: [{
          value: 'VALUE1',
          attributes: { attribute: 'attributeValue1' }
        }, {
          value: 'VALUE2',
          attributes: { attribute: 'attributeValue2' }
        }]
      });
    });

    it('should update a property value and no attribute', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE', {attribute: 'attributeValue'});
      component.updateProperty('PROPERTY', 'NEWVALUE');

      assert.deepEqual(component.properties, {
        PROPERTY: [{
          value: 'NEWVALUE',
          attributes: { attribute: 'attributeValue' }
        }]
      });
    });

    it('should update a property attribute only', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE', {attribute: 'attributeValue'});
      component.updateProperty('PROPERTY', null, {attribute: 'attributeNewValue'});

      assert.deepEqual(component.properties, {
        PROPERTY: [{
          value: 'VALUE',
          attributes: { attribute: 'attributeNewValue' }
        }]
      });
    });

    it('should update a property value and attribute by index', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE1', {attribute: 'attributeValue1'});
      component.addProperty('PROPERTY', 'VALUE2', {attribute: 'attributeValue2'});
      component.updateProperty('PROPERTY', 'NEWVALUE', {attribute: 'attributeNewValue'}, 1);

      assert.deepEqual(component.properties, {
        PROPERTY: [{
          value: 'VALUE1',
          attributes: { attribute: 'attributeValue1' }
        }, {
          value: 'NEWVALUE',
          attributes: { attribute: 'attributeNewValue' }
        }]
      });
    });

    it('should remove property', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE');
      component.removeProperty('PROPERTY');

      assert.deepEqual(component.properties, {});
    });

    it('should remove single property of multiple value property', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE1');
      component.addProperty('PROPERTY', 'VALUE2');
      component.removeProperty('PROPERTY', 1);

      assert.deepEqual(component.properties, {
        PROPERTY: [{
          value: 'VALUE1',
          attributes: {}
        }]
      });
    });

    it('should return values of a multiple value property', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE1');
      component.addProperty('PROPERTY', 'VALUE2');

      assert.deepEqual(component.getPropertyValues('PROPERTY'), ['VALUE1', 'VALUE2']);
    });

    it('should return empty array for not existing property', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      assert.deepEqual(component.getPropertyValues('PROPERTY'), []);
    });

    it('should return null, simple or array for property value', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY1', 'VALUE');
      component.addProperty('PROPERTY2', 'VALUE1');
      component.addProperty('PROPERTY2', 'VALUE2');

      assert.equal(component.getPropertyValuesCompact('PROPERTY0'), null);
      assert.equal(component.getPropertyValuesCompact('PROPERTY1'), 'VALUE');
      assert.deepEqual(component.getPropertyValuesCompact('PROPERTY2'), ['VALUE1', 'VALUE2']);
    });

    it('should return first value of a single value property', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE');

      assert.equal(component.getPropertyValue('PROPERTY'), 'VALUE');
    });

    it('should return first value of multiple value property', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE1');
      component.addProperty('PROPERTY', 'VALUE2');

      assert.equal(component.getPropertyValue('PROPERTY'), 'VALUE1');
    });

    it('should return null for a not existing property', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      assert.equal(component.getPropertyValue('PROPERTY'), null);
    });

    it('should add a child', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addChild(new iCalendar.Component('VABSTRACTCHILD', 'http://example1.org'));

      assert.equal(component.children.length, 1);
      assert.equal(component.children[0].type, 'VABSTRACTCHILD');
      assert.equal(component.children[0]['@id'], 'http://example1.org');
    });

    it('should remove a child', function () {
      var
        component = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        child = new iCalendar.Component('VABSTRACTCHILD', 'http://example1.org');

      component.addChild(child);
      component.removeChild(child);

      assert.equal(component.children.length, 0);
    });

    it('should ignore removing a not existing child', function () {
      var
        component = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        child = new iCalendar.Component('VABSTRACTCHILD', 'http://example1.org');

      component.removeChild(child);

      assert.equal(component.children.length, 0);
    });

    it('should compare type and @id in equals method', function () {
      var
        componentA = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentB = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentC = new iCalendar.Component('VABSTRACT1', 'http://example.org'),
        componentD = new iCalendar.Component('VABSTRACT', 'http://example1.org');

      assert.ok(componentA.equals(componentB));
      assert.ok(!componentA.equals(componentC));
      assert.ok(!componentA.equals(componentD));
    });

    it('should compare property values in equals method', function () {
      var
        componentA = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentB = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentC = new iCalendar.Component('VABSTRACT', 'http://example.org');

      componentA.addProperty('PROPERTY', 'VALUE');
      componentB.addProperty('PROPERTY', 'VALUE');
      componentC.addProperty('PROPERTY', 'VALUE1');

      assert.ok(componentA.equals(componentB));
      assert.ok(!componentA.equals(componentC));
    });

    it('should compare property attributes in equals method', function () {
      var
        componentA = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentB = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentC = new iCalendar.Component('VABSTRACT', 'http://example.org');

      componentA.addProperty('PROPERTY', 'VALUE', { attribute: 'VALUE'});
      componentB.addProperty('PROPERTY', 'VALUE', { attribute: 'VALUE'});
      componentC.addProperty('PROPERTY', 'VALUE', { attribute: 'VALUE1'});

      assert.ok(componentA.equals(componentB));
      assert.ok(!componentA.equals(componentC));
    });

    it('should compare children in equals method', function () {
      var
        componentA = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentB = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentC = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        componentD = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        childC = new iCalendar.Component('VABSTRACTCHILD', 'http://example.org'),
        childD = new iCalendar.Component('VABSTRACTCHILD', 'http://example1.org')

      componentC.addChild(childC);
      componentD.addChild(childD);

      assert.ok(componentA.equals(componentB));
      assert.ok(!componentA.equals(componentC));
      assert.ok(!componentC.equals(componentD));
    });

    it('should create a iCalendar property string', function () {
      var component = new iCalendar.Component('VABSTRACT', 'http://example.org');

      component.addProperty('PROPERTY', 'VALUE', { attribute: 'attributeValue'});

      assert.equal(component.propertyToString('PROPERTY', 0), 'PROPERTY;attribute=attributeValue:VALUE\n');
    });

    it('should create a iCalendar string', function () {
      var
        component = new iCalendar.Component('VABSTRACT', 'http://example.org'),
        child = new iCalendar.Component('VABSTRACTCHILD', 'http://example1.org');

      component.addProperty('PROPERTY', 'VALUE', { attribute: 'attributeValue'});
      component.addChild(child);

      assert.equal(component.toString('PROPERTY', 0),
        'BEGIN:VABSTRACT\n' +
        'PROPERTY;attribute=attributeValue:VALUE\n' +
        'BEGIN:VABSTRACTCHILD\nEND:VABSTRACTCHILD\n' +
        'END:VABSTRACT\n');
    });

    it('should create a component with child from string', function () {
      var
        component = new iCalendar.Component('VABSTRACT'),
        child = new iCalendar.Component('VABSTRACTCHILD'),
        componentFromString = new iCalendar.Component.fromString(
          'BEGIN:VABSTRACT\r\n' +
          'PROPERTY;attribute=attributeValue:VALUE\r\n' +
          'BEGIN:VABSTRACTCHILD\r\nEND:VABSTRACTCHILD\r\n' +
          'END:VABSTRACT\r\n'
        );

      component.addProperty('PROPERTY', 'VALUE', { attribute: 'attributeValue'});
      component.addChild(child);

      assert.ok(component.equals(componentFromString));
    });

    it('should create a component from string using predefined constructor', function () {
      var
        component,
        reached = false;

      iCalendar.Component.classes.VABSTRACT = function () { reached = true; };

      component = new iCalendar.Component.fromString('BEGIN:VABSTRACT\r\nEND:VABSTRACT\r\n');

      assert.ok(reached);
    });

    it('should sort properties in normalizeObject method', function () {
      var object = {
        b: '1',
        a: '2',
        c: '3'
      };

      assert.deepEqual(iCalendar.Component.utils.normalizeObject(object), {
        a: '2',
        b: '1',
        c: '3'
      });
    });

    it('should convert any timestamp to UTC ISOString', function () {
      assert.equal(iCalendar.Component.utils.date.toUTC('2014-09-03T11:00:00+02:00'), '2014-09-03T09:00:00.000Z');
      assert.equal(iCalendar.Component.utils.date.toUTC('2014-09-03T11:00:00-02:00'), '2014-09-03T13:00:00.000Z');
    });

    it('should convert VDate to ISOString', function () {
      assert.equal(iCalendar.Component.utils.date.fromVDate('20140903T110000Z'), '2014-09-03T11:00:00.000Z');
      assert.equal(iCalendar.Component.utils.date.fromVDate('20140903T110000Z', 'Europe/Berlin'), '2014-09-03T09:00:00.000Z');
    });

    it('should convert ISOString to ISOString', function () {
      assert.equal(iCalendar.Component.utils.date.fromISODate('2014-09-03T11:00:00Z'), '2014-09-03T11:00:00.000Z');
      assert.equal(iCalendar.Component.utils.date.fromISODate('2014-09-03T11:00:00Z', 'Europe/Berlin'), '2014-09-03T09:00:00.000Z');
    });
  });

  describe('Event', function () {
    it('should init type, properties and children', function () {
      var event = new iCalendar.Event('http://example.org');

      assert.equal(event['@id'], 'http://example.org', '@id not set');
      assert.equal(event.type, 'VEVENT', 'type not set');
      assert.equal(typeof event.properties, 'object', 'properties not set');
      assert.ok(Array.isArray(event.children), 'children not set');
    });

    it('should add date property', function () {
      var event = new iCalendar.Event('http://example.org');

      event.addDateProperty('DATE', '20140903T110000Z');
      event.addDateProperty('DATETZ', '20140903T110000Z', { TZID: 'Europe/Berlin' });

      assert.deepEqual(event.properties, {
        DATE: [{
          value: '2014-09-03T11:00:00.000Z',
          attributes: {}
        }],
        DATETZ: [{
          value: '2014-09-03T09:00:00.000Z',
          attributes: {}
        }]
      });
    });

    it('should add generic and date properties', function () {
      var event = new iCalendar.Event('http://example.org');

      event.addProperty('GENERIC', 'VALUE');
      event.addProperty('DTSTART', '20140903T110000Z', { TZID: 'Europe/Berlin' });
      event.addProperty('DTEND', '20140903T110000Z');

      assert.deepEqual(event.properties, {
        GENERIC: [{
          value: 'VALUE',
          attributes: {}
        }],
        DTSTART: [{
          value: '2014-09-03T09:00:00.000Z',
          attributes: {}
        }],
        DTEND: [{
          value: '2014-09-03T11:00:00.000Z',
          attributes: {}
        }]
      });
    });

    it('should create a iCalendar string for a date property', function () {
      var event = new iCalendar.Event('http://example.org');

      event.addDateProperty('DATE', '20140903T110000Z', { attribute: 'attributeValue' });

      assert.equal(event.datePropertyToString('DATE', 0), 'DATE;attribute=attributeValue:20140903T110000Z\n');
    });

    it('should create a iCalendar string and distinguish property type', function () {
      var event = new iCalendar.Event('http://example.org');

      event.addProperty('PROPERTY', 'VALUE');
      event.addDateProperty('DTSTART', '20140903T110000Z');

      assert.equal(event.propertyToString('PROPERTY', 0), 'PROPERTY:VALUE\n');
      assert.equal(event.propertyToString('DTSTART', 0), 'DTSTART:20140903T110000Z\n');
    });

    it('should handle uuid property', function () {
      var event = new iCalendar.Event('http://example.org');

      event.uuid('VALUE');

      assert.equal(event.uuid(), 'VALUE');
    });

    it('should handle startDate property', function () {
      var event = new iCalendar.Event('http://example.org');

      event.startDate('2014-09-03T09:00:00.000Z');

      assert.equal(event.startDate(), '2014-09-03T09:00:00.000Z');
    });

    it('should handle endDate property', function () {
      var event = new iCalendar.Event('http://example.org');

      event.endDate('2014-09-03T09:00:00.000Z');

      assert.equal(event.endDate(), '2014-09-03T09:00:00.000Z');
    });

    it('should handle summary property', function () {
      var event = new iCalendar.Event('http://example.org');

      event.summary('VALUE');

      assert.equal(event.summary(), 'VALUE');
    });

    it('should handle location property', function () {
      var event = new iCalendar.Event('http://example.org');

      event.location('VALUE');

      assert.equal(event.location(), 'VALUE');
    });

    it('should create a basic json object', function () {
      var event = new iCalendar.Event('http://example.org');

      assert.deepEqual(event.toJSON(), {
        '@context': 'http://schema.org',
        '@id': 'http://example.org',
        '@type': 'Event'
      });
    });

    it('should create a json object', function () {
      var event = new iCalendar.Event('http://example.org');

      event.addProperty('UID', 'E06F3512-5065-476F-9A78-9471819EA40F');
      event.addProperty('DTSTART', '2014-09-03T09:00:00.000Z');
      event.addProperty('DTEND', '2014-09-03T11:00:00.000Z');
      event.addProperty('SUMMARY', 'Summary');
      event.addProperty('LOCATION', 'Location1');
      event.addProperty('LOCATION', 'Location2');

      assert.deepEqual(event.toJSON(), {
        '@context': 'http://schema.org',
        '@id': 'http://example.org',
        '@type': 'Event',
        description: 'Summary',
        endDate: '2014-09-03T11:00:00.000Z',
        location: [ 'Location1', 'Location2' ],
        sameAs: 'E06F3512-5065-476F-9A78-9471819EA40F',
        startDate: '2014-09-03T09:00:00.000Z'
      });
    });

    it('should create a basic event from a empty json object', function () {
      var event = new iCalendar.Event.fromJSON({});

      //TODO: assert.equal(event['@id'], null);
      assert.equal(event.getPropertyValue('UID') == null, false);
    });

    it('should create an event from a json object', function () {
      var event = new iCalendar.Event.fromJSON({
        '@context': 'http://schema.org',
        '@id': 'http://example.org',
        '@type': 'Event',
        description: 'Summary',
        endDate: '2014-09-03T11:00:00.000Z',
        location: [ 'Location1', 'Location2' ],
        sameAs: 'E06F3512-5065-476F-9A78-9471819EA40F',
        startDate: '2014-09-03T09:00:00.000Z'
      });

      assert.equal(event['@id'], 'http://example.org');
      assert.equal(event.getPropertyValue('SUMMARY'), 'Summary');
      assert.equal(event.getPropertyValue('DTEND'), '2014-09-03T11:00:00.000Z');
      assert.deepEqual(event.getPropertyValue('LOCATION'), [ 'Location1', 'Location2' ]);
      assert.equal(event.getPropertyValue('UID'), 'E06F3512-5065-476F-9A78-9471819EA40F');
      assert.equal(event.getPropertyValue('DTSTART'), '2014-09-03T09:00:00.000Z');
    });
  });
});