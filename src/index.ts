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


/**
 * Creates a logrocket-mobx plugin for the given LogRocket instance
 * @param logrocket LogRocket instance
 */
export default function createPlugin(logrocket: typeof LogRocket) {
  if (typeof logrocket !== 'object' || typeof logrocket.log !== 'function') {
    throw new Error('Missing logrocket instance. Be sure you are passing LogRocket into logrocket-mobx.');
  }

  /**
   * Watches a MobX observable value (created using observable.box)
   * @param target Observable primitive value
   * @param options optional options (name and sanitizer function)
   */
  function watchValue<T>(
    target: IObservableValue<T> | IComputedValue<T>,
    options?: {
      /** optional identifier to include in the log */
      name?: string,
      /** optional sanitizer function which sanitizes the change object */
      sanitizer?: (change: IValueDidChange<T>) => IValueDidChange<T>,
    },
  ): void {
    const sanitizer = options && typeof options.sanitizer === 'function' ? options.sanitizer : null;
    const name = options && typeof options.name !== 'undefined' ? options.name : null;
    invariant(isObservable(target), 'Target must be observable');
    invariant(
      typeof sanitizer === 'function' || sanitizer == null,
      `sanitizer property must be a function, was given a ${typeof sanitizer}`
    );
    const nameStr = name !== null ? ` "${name}"` : '';

    observe(target, (change: IValueDidChange<T>) => {
      const sanitizedChange = sanitizer ? sanitizer({ ...change}) : change;
      logrocket.log(`MobX value change${nameStr}:`, sanitizedChange);
    }, false);
  }

  /**
   * Watches a MobX observable Array
   * @param target Observable Array
   * @param options optional options (name and sanitizer function)
   */
  function watchArray<T>(
    target: IObservableArray<T>,
    options?: {
      /** optional identifier to include in the log */
      name?: string,
      /** optional sanitizer function which sanitizes the change object */
      sanitizer?: (change: IArrayChange<T> | IArraySplice<T>) => IArrayChange<T> | IArraySplice<T>,
    }
  ): void {
    const sanitizer = options && typeof options.sanitizer === 'function' ? options.sanitizer : null;
    const name = options && typeof options.name !== 'undefined' ? options.name : null;
    invariant(isObservable(target), 'Target must be observable');
    invariant(
      typeof sanitizer === 'function' || sanitizer === null,
      `sanitizer property must be a function, was given a ${typeof sanitizer}`
    );
    const nameStr = name !== null ? ` "${name}"` : '';

    observe(target, (change: IArrayChange<T> | IArraySplice<T>) => {
      const sanitizedChange = sanitizer ? sanitizer({ ...change}) : change;
      logrocket.log(`MobX Array change${nameStr}:`, sanitizedChange);
    }, false);
  }

  /**
   * Watches a MobX observable Object
   * @param target Observable Object
   * @param property optional property to watch instead of the entire object
   * @param options optional options (name and sanitizer function)
   */
  function watchObject(
    target: Object,
    property?: string,
    options?: {
      /** optional identifier to include in the log */
      name?: string,
      /** optional sanitizer function which sanitizes the change object */
      sanitizer?: (change: IObjectDidChange) => IObjectDidChange,
    }
  ): void;
  function watchObject<T, K extends keyof T>(
    target: T,
    property: K | null,
    options?: {
      /** optional identifier to include in the log */
      name?: string,
      /** optional sanitizer function which sanitizes the change object */
      sanitizer?: (change: IValueDidChange<T[K]> | IObjectDidChange) => IValueDidChange<T[K]> | IObjectDidChange,
    }
  ): void {
    const sanitizer = options && typeof options.sanitizer === 'function' ? options.sanitizer : null;
    const name = options && typeof options.name !== 'undefined' ? options.name : null;
    invariant(isObservable(target), 'Target must be observable');
    invariant(
      typeof sanitizer === 'function' || sanitizer === null,
      `sanitizer property must be a function, was given a ${typeof sanitizer}`
    );
    const nameStr = name !== null ? ` "${name}"` : '';

    if (typeof property === 'string') {
      observe<T, K>(target, property, (change: IValueDidChange<T[K]> | IObjectDidChange) => {
        const sanitizedChange = sanitizer ? sanitizer({ ...change}) : change;
        logrocket.log(`MobX Object property change${nameStr}:`, sanitizedChange);
      }, false);
    } else {
      observe(target, (change: IValueDidChange<T[K]> | IObjectDidChange) => {
        const sanitizedChange = sanitizer ? sanitizer({ ...change}) : change;
        logrocket.log(`MobX Object change${nameStr}:`, sanitizedChange);
      }, false);
    }
  }

  /**
   * Watches a MobX observable Map
   * @param target Observable Map
   * @param key optional key to watch for instead of the entire Map
   * @param options optional options (name and sanitizer function)
   */
  function watchMap<K, V>(
    target: ObservableMap<K, V>,
    key?: K,
    options?: {
      /** optional identifier to include in the log */
      name?: string,
      /** optional sanitizer function which sanitizes the change object */
      sanitizer?: (change: IMapDidChange<K, V>) => IMapDidChange<K, V>,
    }
  ): void;
  function watchMap<K, V>(
    target: ObservableMap<K, V>,
    key: K,
    options?: {
      /** optional identifier to include in the log */
      name?: string,
      /** optional sanitizer function which sanitizes the change object */
      sanitizer?: (change: IValueDidChange<V> | IMapDidChange<K, V>) => IValueDidChange<V> | IMapDidChange<K, V>,
    }
  ): void {
    const sanitizer = options && typeof options.sanitizer === 'function' ? options.sanitizer : null;
    const name = options && typeof options.name !== 'undefined' ? options.name : null;
    invariant(isObservable(target), 'Target must be observable');
    invariant(
      typeof sanitizer === 'function' || sanitizer === null,
      `sanitizer property must be a function, was given a ${typeof sanitizer}`
    );
    const nameStr = name !== null ? ` "${name}"` : '';

    if (typeof key !== 'undefined' && key !== null) {
      observe<K, V>(target, key, (change: IValueDidChange<V>) => {
        const sanitizedChange = sanitizer ? sanitizer({ ...change}) : change;
        logrocket.log(`MobX Map property change${nameStr}:`, sanitizedChange);
      }, false);
    } else {
      observe<K, V>(target, (change: IMapDidChange<K, V>) => {
        const sanitizedChange = sanitizer ? sanitizer({ ...change}) : change;
        logrocket.log(`MobX Map change${nameStr}:`, sanitizedChange);
      }, false);
    }
  }

  return { watchValue, watchArray, watchObject, watchMap };
}
