# LogRocket MobX Plugin
This plugin augments LogRocket sessions to include changes to your MobX observables.


## Usage

As a function:
```js
import createPlugin from 'logrocket-mobx';
import { observable } from 'mobx';


// hook up the plugin to LogRocket
const { logObservable } = createPlugin(LogRocket);

// create an observable
const person = observable({
  firstName: 'John',
  lastName: 'Doe'
});

// give the observable instance to the logger
logObservable()(person);

// trigger a changes
person.firstName = 'Jack';
```

Or as a decorator:
```js
import createPlugin from 'logrocket-mobx';
import { observable } from 'mobx';


// hook up the plugin to LogRocket
const mobxLogger = createPlugin(LogRocket);

// create an observable wrapping logObservable with it
class Person {
  @logObservable
  @observable
  name = 'John'
}

const doe = new Person();

// trigger a change
doe.name = 'Jack';
```


After the last line, you will get the following in your LogRocket session:

// TODO: screenshot of the plugin in logrocket


## Resources
[Documentation](https://docs.logrocket.com/docs/)
