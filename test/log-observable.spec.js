import createPlugin from '../src';
import { observable } from 'mobx';
import expect from 'expect.js';
import sinon from 'sinon';


describe('logObservable', () => {
  let plugin;
  let logObservableSpy;
  let logrocketLogSpy;

  before(() => {
    const logRocket = {
      log(...stuff) { // eslint-disable-line
        // console.log.apply(null, stuff); // eslint-disable-line
      }
    };

    plugin = createPlugin(logRocket);
    logObservableSpy = sinon.spy(plugin, 'logObservable');
    logrocketLogSpy = sinon.spy(logRocket, 'log');
  });

  afterEach(() => {
    logObservableSpy.reset();
    logrocketLogSpy.reset();
  });

  after(() => {
    logObservableSpy.restore();
    logrocketLogSpy.restore();
  });

  it('should fail if the user incorrectly initializes the plugin', () => {
    expect(() => createPlugin()).to.throwError();
  });

  describe('work when used as a function', () => {
    it('should log changes', () => {
      // create an observable
      const person = observable({
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(person.firstName).to.eql('John');

      // give the observable instance to the logger
      plugin.logObservable(person);

      // trigger a changes
      person.firstName = 'Jack';


      expect(person.firstName).to.eql('Jack');
      expect(logObservableSpy.callCount).to.be(1);
      expect(logrocketLogSpy.callCount).to.be(1);
    });

    it('and filter events', () => {
      // create an observable
      const person = observable({
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(person.firstName).to.eql('John');

      // give the observable instance to the logger
      plugin.logObservable(person, event => false); // eslint-disable-line

      // trigger a changes
      person.firstName = 'Jack';


      expect(person.firstName).to.eql('Jack');
      expect(logObservableSpy.callCount).to.be(1);
      expect(logrocketLogSpy.callCount).to.be(0);
    });

    it('and sanitize events', () => {
      // create an observable
      const person = observable({
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(person.firstName).to.eql('John');

      // give the observable instance to the logger
      plugin.logObservable(person, event => {
        event.newValue = 'FOO';
        return event;
      }); // eslint-disable-line

      // trigger a changes
      person.firstName = 'Jack';


      expect(person.firstName).to.eql('Jack');
      expect(logObservableSpy.callCount).to.be(1);
      expect(logrocketLogSpy.callCount).to.be(1);
      expect(logrocketLogSpy.firstCall.args[1].newValue).to.be('FOO');
    });

    it('should warn when you give an unobservable value', () => {
      expect(() => plugin.logObservable({})).to.throwError();
    });
  });

  describe('work when used as a decorator', () => {
    it('should log changes', () => {
      // create an observable
      class Person {
        @plugin.logObservable @observable firstName = 'John'
        lastName = 'Doe'
      }

      const person = new Person();

      expect(person.firstName).to.eql('John');

      // trigger a changes
      person.firstName = 'Jack';

      expect(person.firstName).to.eql('Jack');
      expect(logObservableSpy.callCount).to.be(1);
      expect(logrocketLogSpy.callCount).to.be(1);
      expect(logrocketLogSpy.threw()).to.not.be.ok();
      expect(logrocketLogSpy.args[0][0]).to.eql('change');
      expect(logrocketLogSpy.args[0][1].type).to.eql('update');
    });

    it('and filter events', () => {
      // create an observable
      const sanitizer = event => false // eslint-disable-line
      class Person {
        @plugin.logObservable(sanitizer) @observable firstName = 'John'
        lastName = 'Doe'
      }

      const person = new Person();

      expect(person.firstName).to.eql('John');

      // trigger a changes
      person.firstName = 'Jack';

      expect(person.firstName).to.eql('Jack');
      expect(logObservableSpy.callCount).to.be(1);
      expect(logrocketLogSpy.callCount).to.be(0);
    });

    it('and sanitize events', () => {
      // create an observable
      const sanitizer = event => {
        event.newValue = 'FOO';
        return event;
      };
      class Person {
        @plugin.logObservable(sanitizer) @observable firstName = 'John'
        lastName = 'Doe'
      }

      const person = new Person();

      expect(person.firstName).to.eql('John');

      // trigger a changes
      person.firstName = 'Jack';

      expect(person.firstName).to.eql('Jack');
      expect(logObservableSpy.callCount).to.be(1);
      expect(logrocketLogSpy.callCount).to.be(1);
      expect(logrocketLogSpy.firstCall.args[1].newValue).to.be('FOO');
    });

    it('should warn when you give an unobservable value', () => {
      expect(() => plugin.logObservable({})).to.throwError();
    });
  });
});
