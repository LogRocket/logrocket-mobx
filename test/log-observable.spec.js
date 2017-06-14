import createPlugin from '../src';
import { observe, observable } from 'mobx';


console.log = jest.fn();

const logRocket = {
  log(...stuff) {
    console.log.apply(null, stuff);
  }
};

describe('logObservable', () => {
  let plugin;
  let logObservableSpy;
  let logrocketLogSpy;

  beforeEach(() => {
    plugin = createPlugin(logRocket);
    logObservableSpy = jest.spyOn(plugin, 'logObservable');
    logrocketLogSpy = jest.spyOn(logRocket, 'log');
  });

  afterEach(() => {
    logObservableSpy.mockRestore();
    logrocketLogSpy.mockRestore();
  });

  it('should log changes when used as a function', () => {
    // create an observable
    const person = observable({
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(person.firstName).toEqual('John');

    // give the observable instance to the logger
    plugin.logObservable(person);

    // trigger a changes
    person.firstName = 'Jack';


    expect(person.firstName).toEqual('Jack');
    expect(logObservableSpy).toHaveBeenCalledTimes(1);
    expect(logrocketLogSpy).toHaveBeenCalledTimes(1);

    expect(console.log).toBeCalledWith(
      'change',
      {
        name: "firstName",
        newValue: "Jack",
        oldValue: "John",
        type: "update"
      }
    );
  });

  it('should support sanitizer when used as a function', () => {
    // create an observable
    const person = observable({
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(person.firstName).toEqual('John');

    // give the observable instance to the logger
    plugin.logObservable(person, event => false);

    // trigger a changes
    person.firstName = 'Jack';


    expect(person.firstName).toEqual('Jack');
    expect(logObservableSpy).toHaveBeenCalledTimes(1);
    expect(logrocketLogSpy).toHaveBeenCalledTimes(0);
  });

  it('should log changes when used as a decorator', () => {
    // create an observable
    class Person {
      @plugin.logObservable @observable firstName = 'John'
      lastName = 'Doe'
    }

    const person = new Person();

    expect(person.firstName).toEqual('John');

    // trigger a changes
    person.firstName = 'Jack';


    expect(person.firstName).toEqual('Jack');
    expect(logObservableSpy).toHaveBeenCalledTimes(1);
    expect(logrocketLogSpy).toHaveBeenCalledTimes(1);
    expect(console.log).toBeCalledWith(
      'change',
      {
        type: 'update',
        newValue: 'Jack',
        oldValue: 'John',
        observerName: 'Person@3.firstName'
      }
    );
  });

  it('should support sanitizer property as a decorator', () => {
    // create an observable
    const sanitizer = event => false
    class Person {
      @plugin.logObservable(sanitizer) @observable firstName = 'John'
      lastName = 'Doe'
    }

    const person = new Person();

    expect(person.firstName).toEqual('John');

    // trigger a changes
    person.firstName = 'Jack';

    expect(person.firstName).toEqual('Jack');
    expect(logObservableSpy).toHaveBeenCalledTimes(1);
    expect(logrocketLogSpy).toHaveBeenCalledTimes(0);
  });
});
