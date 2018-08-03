import {
  observe,
  IObjectDidChange,
  IObservableValue,
  IComputedValue,
  IMapDidChange,
  IValueDidChange,
  ObservableMap,
  isObservable,
  IObservableArray,
  IArrayChange,
  IArraySplice,
} from 'mobx';
import LogRocket = require('logrocket');
import invariant = require('invariant');


export default function createPlugin(logrocket: typeof LogRocket) {
  if (typeof logrocket !== 'object' || typeof logrocket.log !== 'function') {
    throw new Error('Missing logrocket instance. Be sure you are passing LogRocket into logrocket-mobx.');
  }

  // observe value
  function watchValue<T>(
    target: IObservableValue<T> | IComputedValue<T>,
    options?: {
      name?: string,
      sanitizer?: (change: IValueDidChange<T>) => IValueDidChange<T>,
    },
  ): void {
    const sanitizer = options ? options.sanitizer : null;
    const name = options ? options.name : null;
    invariant(isObservable(target), 'Target must be observable');
    invariant(
      typeof sanitizer === 'function' || sanitizer == null,
      `sanitizer property must be a function, was given a ${typeof sanitizer}`
    );
    const nameStr = name !== null ? ` "${name}"` : '';

    observe(target, (change: IValueDidChange<T>) => {
      const sanitizedChange = sanitizer ? sanitizer(change) : change;
      logrocket.log(`MobX value change${nameStr}:`, sanitizedChange);
    }, false);
  }

  // observe array
  function watchArray<T>(
    target: IObservableArray<T>,
    options?: {
      name?: string,
      sanitizer?: (change: IArrayChange<T> | IArraySplice<T>) => IArrayChange<T> | IArraySplice<T>,
    }
  ): void {
    const sanitizer = options ? options.sanitizer : null;
    const name = options ? options.name : null;
    invariant(isObservable(target), 'Target must be observable');
    invariant(
      typeof sanitizer === 'function' || sanitizer === null,
      `sanitizer property must be a function, was given a ${typeof sanitizer}`
    );
    const nameStr = name !== null ? ` "${name}"` : '';

    observe(target, (change: IArrayChange<T> | IArraySplice<T>) => {
      const sanitizedChange = sanitizer ? sanitizer(change) : change;
      logrocket.log(`MobX Array change${nameStr}:`, sanitizedChange);
    }, false);
  }

  // observe object
  function watchObject(
    target: Object,
    options?: {
      name?: string,
      sanitizer?: (change: IObjectDidChange) => IObjectDidChange,
    }
  ): void;
  // observe object property
  function watchObject<T, K extends keyof T>(
    target: T,
    property: K,
    options?: {
      name?: string,
      sanitizer?: (change: IValueDidChange<T[K]> | IObjectDidChange) => IValueDidChange<T[K]> | IObjectDidChange,
    }
  ): void {
    const sanitizer = options ? options.sanitizer : null;
    const name = options ? options.name : null;
    invariant(isObservable(target), 'Target must be observable');
    invariant(
      typeof sanitizer === 'function' || sanitizer === null,
      `sanitizer property must be a function, was given a ${typeof sanitizer}`
    );
    const nameStr = name !== null ? ` "${name}"` : '';

    if (property !== undefined) {
      observe<T, K>(target, property, (change: IValueDidChange<T[K]> | IObjectDidChange) => {
        const sanitizedChange = sanitizer ? sanitizer(change) : change;
        logrocket.log(`MobX Object change${nameStr}:`, sanitizedChange);
      }, false);
    } else {
      observe(target, (change: IValueDidChange<T[K]> | IObjectDidChange) => {
        const sanitizedChange = sanitizer ? sanitizer(change) : change;
        logrocket.log(`MobX Object change${nameStr}:`, sanitizedChange);
      }, false);
    }
  }

  // observe Map
  function watchMap<K, V>(
    target: ObservableMap<K, V>,
    options?: {
      name?: string,
      sanitizer?: (change: IMapDidChange<K, V>) => IMapDidChange<K, V>,
    }
  ): void;
  // observe Map property
  function watchMap<K, V>(
    target: ObservableMap<K, V>,
    property: K,
    options?: {
      name?: string,
      sanitizer?: (change: IValueDidChange<V> | IMapDidChange<K, V>) => IValueDidChange<V> | IMapDidChange<K, V>,
    }
  ): void {
    const sanitizer = options ? options.sanitizer : null;
    const name = options ? options.name : null;
    invariant(isObservable(target), 'Target must be observable');
    invariant(
      typeof sanitizer === 'function' || sanitizer === null,
      `sanitizer property must be a function, was given a ${typeof sanitizer}`
    );
    const nameStr = name !== null ? ` "${name}"` : '';

    if (property !== undefined) {
      observe<K, V>(target, property, (change: IValueDidChange<V>) => {
        const sanitizedChange = sanitizer ? sanitizer(change) : change;
        logrocket.log(`MobX Map change${nameStr}:`, sanitizedChange);
      }, false);
    } else {
      observe<K, V>(target, (change: IMapDidChange<K, V>) => {
        const sanitizedChange = sanitizer ? sanitizer(change) : change;
        logrocket.log(`MobX Map change${nameStr}:`, sanitizedChange);
      }, false);
    }
  }

  return { watchValue, watchArray, watchObject, watchMap };
}
