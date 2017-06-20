import { observe, isObservable } from 'mobx';
import invariant from 'invariant';
import kindOf from 'kind-of';
import isDataDescriptor from 'is-data-descriptor';
import isAccessorDescriptor from 'is-accessor-descriptor';


const isDescriptor = value => {
  if (!kindOf(value) === 'object') {
    return false;
  }
  if ('get' in value) {
    return isAccessorDescriptor(value);
  }
  return isDataDescriptor(value);
}

const isUndefined = value => typeof value === 'undefined';
const isFunction = value => typeof value === 'function';

export default function createPlugin(logrocket) {
  const observeProperty = (target, property, sanitizer = (event => event)) => {
    invariant(isObservable(target), 'Target must be observable');
    invariant(isFunction(sanitizer) || isUndefined(sanitizer), `sanitizer property must be a function, was given a ${typeof sanitizer}`);

    observe(target, property, change => {
      // if we have an observer name, add it
      if (!isUndefined(change.object.name)) {
        change.observerName = change.object.name;
      }

      // remove the observable property because it can't be sanitized
      delete change.object;

      const sanitized = sanitizer(change);
      if (sanitized) {
        logrocket.log('change', sanitized);
      }
    });
  };

  const decorate = (props, sanitizer) => {
    const [instance, property, descriptor] = props;

    // the property won't exist until mobx adds it when its needed
    // so let's wait until it is by adding a callback to __mobxLazyInitializers
    // see mobx-decorators for examples of this
    instance.__mobxLazyInitializers = (instance.__mobxLazyInitializers || []).slice();
    instance.__mobxLazyInitializers.push(instance => {
      observeProperty(instance, property, sanitizer);
    });

    descriptor.configurable = true;
    return descriptor;
  };

  return {
    logObservable(...props) {
      if (isDescriptor(props[props.length - 1])) {
        // used as a decorator
        decorate(props);
      } else if (isFunction(props[0])) {
        // used as a decorator factory
        const sanitizer = props[0];
        return (...props) => decorate(props, sanitizer);
      } else {
        // used as a function
        const target = props[0];
        const sanitizer = props[1];
        observeProperty(target, undefined, sanitizer);
      }
    }
  }
}
