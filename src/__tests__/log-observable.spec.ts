import LogRocket = require('logrocket');
import { observable, IValueDidChange } from 'mobx';
import createPlugin from '..';
jest.mock('logrocket');

describe('logrocket-mobx', () => {
  let plugin: ReturnType<typeof createPlugin>;

  beforeEach(() => {
    LogRocket.init('apphub/logrocket');
    plugin = createPlugin(LogRocket);
    expect(plugin.watchObject).not.toBe(undefined);
    LogRocket.log = jest.fn();
  });

  describe('watchValue', () => {
    it('watch changes', () => {
      const value = observable.box('foobar');
      plugin.watchValue(value);
      value.set('barbaz');
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX value change:');
      expect(calls[0][1].oldValue).toBe('foobar');
      expect(calls[0][1].newValue).toBe('barbaz');
    });

    it('sanitize', () => {
      const value = observable.box('foobar');
      plugin.watchValue(value, {
        sanitizer: (change: IValueDidChange<string>) => {
          change.newValue = change.newValue.replace(/a/g, 'b');
          return change;
        }
      });
      value.set('barbaz');
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX value change:');
      expect(calls[0][1].oldValue).toBe('foobar');
      expect(calls[0][1].newValue).toBe('bbrbbz');
    });
  });

  describe('watchObject', () => {
    it('watch changes to object', () => {
      const value = observable({
        foo: '1',
        bar: true,
      });
      plugin.watchObject(value);
      value.foo = '2';
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX Object change:');
      expect(calls[0][1].name).toBe('foo');
      expect(calls[0][1].oldValue).toBe('1');
      expect(calls[0][1].newValue).toBe('2');
    });

    it('watch changes to property', () => {
      const value = observable({
        foo: '1',
        bar: true,
      });
      plugin.watchObject(value, 'foo');
      value.foo = '2';
      value.bar = false;
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX Object property change:');
      expect(calls[0][1].oldValue).toBe('1');
      expect(calls[0][1].newValue).toBe('2');
    })

    it('sanitize', () => {
      const value = observable({
        foo: '1',
        bar: true,
      });
      plugin.watchObject(value, null, {
        sanitizer: (change) => {
          change.name = undefined;
          return change;
        }
      });
      value.foo = '2';
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX Object change:');
      expect(calls[0][1].name).toBe(undefined);
      expect(calls[0][1].oldValue).toBe('1');
      expect(calls[0][1].newValue).toBe('2');
    });
  });

  describe('watchMap', () => {
    it('watch changes to map', () => {
      const value = observable(new Map([
        ['foo', 1],
        ['bar', 2],
      ]));
      plugin.watchMap(value);
      value.set('foo', 3);
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX Map change:');
      expect(calls[0][1].name).toBe('foo');
      expect(calls[0][1].oldValue).toBe(1);
      expect(calls[0][1].newValue).toBe(3);
    });

    it('watch changes to property', () => {
      const value = observable(new Map([
        ['foo', 1],
        ['bar', 2],
      ]));
      plugin.watchMap(value, 'foo');
      value.set('foo', 3);
      value.set('bar', 123);
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX Map property change:');
      expect(calls[0][1].oldValue).toBe(1);
      expect(calls[0][1].newValue).toBe(3);
    });

    it('sanitize', () => {
      const value = observable(new Map([
        ['foo', 1],
        ['bar', 2],
      ]));
      plugin.watchMap(value, null, {
        sanitizer: change => {
          change.name = undefined;
          return change;
        }
      });
      value.set('foo', 3);
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX Map change:');
      expect(calls[0][1].name).toBe(undefined);
      expect(calls[0][1].oldValue).toBe(1);
      expect(calls[0][1].newValue).toBe(3);
    });
  });

  describe('watchArray', () => {
    it('watch changes', () => {
      const value = observable(new Array());
      plugin.watchArray(value);
      value.push(1);
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX Array change:');
      expect(calls[0][1].addedCount).toBe(1);
      expect(calls[0][1].removedCount).toBe(0);
      expect(calls[0][1].index).toBe(0);
      expect(calls[0][1].added).toEqual([1]);
      expect(calls[0][1].removed).toEqual([]);
    });

    it('sanitize', () => {
      const value = observable(new Array());
      plugin.watchArray(value, {
        sanitizer: change => {
          change.index = undefined;
          return change;
        }
      });
      value.push(1);
      const calls = (LogRocket.log as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('MobX Array change:');
      expect(calls[0][1].addedCount).toBe(1);
      expect(calls[0][1].removedCount).toBe(0);
      expect(calls[0][1].index).toBe(undefined);
      expect(calls[0][1].added).toEqual([1]);
      expect(calls[0][1].removed).toEqual([]);
    })
  });
});
