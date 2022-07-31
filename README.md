# still-redux

`Still-redux` is a utility that provides fast development of `redux` applications with a good developer experience. It's not a state manager, but a small wrapper around `redux` and is suitable for use in projects where `react-redux` is already used.

Made with respect to:  
:star_struck: good api for fast development  
:100: redux compatibility  
:rocket: typescript support  

Forget what you know about `redux`. With `still-redux`, there are only two simple steps:
1) define the initial state
2) describe the business logic in the hook

## installation

Npm:
```
npm i still-redux
```

Yarn:
```
yarn still-redux
```

## example

Typical todolist:

```javascript
import { createFeature, useFieldState } from "still-redux";

export const todolist = createFeature('todolist', {
   items: [{text: 'add todos', completed: false}],
   title: 'my todolist',
})

export const useTodolist = () => {
   const [todos, setTodos] = useFieldState(todolist.items);
   const [listTitle, setListTitle] = useFieldState(todolist.title);

   const completedCount = todos.reduce<number>(
       (count, item) => count + (item.completed ? 1 : 0),
       0
   );

   const inProgressCount = todos.length - completedCount;

   const addTodoItem = (text: string) => {
       if (!text || todos.some(item => item.text === text)) { return }
       setTodos((items) => {
           items.push({text, completed: false});
           return items;
       });
   }

   const removeTodoItem = (index: number) => {
       setTodos(items => {
           items.splice(index,1);
           return items
       })
   }

   const toggleTodoItem = (itemIndex: number) => setTodos(items => {
       items[itemIndex].completed = !items[itemIndex].completed;
       return items;
   });

   return {
       data: { todos, completedCount, inProgressCount, listTitle },
       handlers: { addTodoItem, removeTodoItem, toggleTodoItem, setListTitle },
   }
}
```

Now just add the automatically generated reducer to your root reducer:

```javascript
import { combineReducers, createStore} from 'redux'
import { todolist } from "../features/todolist";

const rootReducer = combineReducers({
   ...todolist.getReducer(),
   // ... other reducers
})
```

And it's all :muscle: With `createFeature` and `useFieldState` everything is done.

## API

### createFeature

The `createFeature` function takes a unique feature name and initial feature state. The returned object duplicates the initial state keys and used in special hooks.

```javascript
import { createFeature } from "still-redux";

export const myFeature = createFeature('featureName', featureInitialState);
```

It also takes an `options` with `featureSelector` for the case when you are using a nested store structure, i.e. with nested combineReducers:

```javascript
import { combineReducers, createStore } from 'redux';
import { createFeature } from "still-redux";

  const feature = createFeature(
    'feature', 
    featureInitialState,
    { featureSelector: (state) => state.featureScope.feature });

  const store = createStore(
    combineReducers({
        featureScope: combineReducers({ 
          ...feature.getReducer() 
        }),
    })
  );
```

If featureSelector is not set, path state[featureName] will be used.

### useFieldState

```javascript
import { useFieldState } from "still-redux";

   const [someField, setSomeField] = useFieldState(myFeature.someField);
```

The `useFieldState` hook is similar to the standard `useState` and does the same thing, but do it for redux store. It subscribes to the value of a field in the redux store and provides a method to update it. The update method works the same way as the update method from `useState`. The setter of `useFieldState` could receive:

* value
* callback that takes the current value and returns the changed value.

For example:

```javascript
setSomeField([1,1,1])
setSomeField((currentArray) => currentArray.filter(value => value === 1)) // mutation is ok
```

### useFieldGetter and useFieldSetter

It is possible to use these hooks instead of `useFieldState` if you need to get just the value from the store or just it's setter. `useFieldSetter` can be useful if you only want to change the value, but don't want to create a subscription.

```javascript
import { createFeature, useFieldState } from "still-redux";
  
const someField = useFieldGetter(myFeature.someField);
const setSomeField = useFieldSetter(myFeature.someField);
```

### getReducer

`getReducer` is a helper from an object created by the `createFeature` function. Used to combine a feature reducer with a root reducer.

```javascript
import { combineReducers, createStore} from 'redux'
import { getReducer } from "still-redux";

const rootReducer = combineReducers({
   ...getReducer(myFeature), // the object is {featureName: reducerFn}
   // ... other reducers
})
```

## Compatibility with the Redux ecosystem

You can get selector and actionCreator for any field created with `createFeature`.

ActionCreator takes either an object or a field modifier function.

```javascript
import { createFeature } from "still-redux";


export const todolist = createFeature('todolist', {
   items: [{text: 'add todos', completed: false}],
   title: 'my todolist',
})

const { selector, actionCreator} = todolist.items;
```

Action Type can be obtained from actionCreator:

```javascript
const actionType = actionCreator.toString();
```
