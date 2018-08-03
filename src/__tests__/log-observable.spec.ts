import LogRocket = require('logrocket');
import { observable } from 'mobx';
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

  it('watchValue', () => {
    const value = observable.box('foobar');
    plugin.watchValue(value);
    value.set('barbaz');
    const calls = (LogRocket.log as jest.Mock).mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe('MobX value change:');
    expect(calls[0][1].oldValue).toBe('foobar');
    expect(calls[0][1].newValue).toBe('barbaz');
  });

  it('watchObject', () => {
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

  it('watchMap', () => {
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

  it('watchArray', () => {
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
});
