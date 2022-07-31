import * as rtl from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { createFeature } from '../../lib/createFeature';
import { useFieldGetter, useFieldSetter, useFieldState } from '../../lib/hooks';

const featureInitialState = {
  array: [{ foo: 'bar' }, { foo: 'baz' }],
  string: 'string',
};

export const getBaseTestedEntities = () => {
  const testedFeature = createFeature('test', featureInitialState);

  const store = createStore(
    combineReducers({
      ...testedFeature.getReducer(),
    })
  );

  const FirstTestedComponent = () => {
    const [array, setArray] = useFieldState(testedFeature.array);
    const [string, setString] = useFieldState(testedFeature.string);
    firstTestedComponentPublicHookApi.useFieldState.array = array;
    firstTestedComponentPublicHookApi.useFieldState.setArray = setArray;
    firstTestedComponentPublicHookApi.useFieldState.string = string;
    firstTestedComponentPublicHookApi.useFieldState.setString = setString;
    return <div />;
  };

  const SecondTestedComponent = () => {
    const string = useFieldGetter(testedFeature.string);
    const setString = useFieldSetter(testedFeature.string);
    secondTestedComponentPublicHookApi.useFieldGetter.string = string;
    secondTestedComponentPublicHookApi.useFieldSetter.setString = setString;
    return <div />;
  };

  const renderComponents = () => {
    rtl.render(
      <Provider store={store}>
        <FirstTestedComponent />
        <SecondTestedComponent />
      </Provider>
    );
  };

  const firstTestedComponentPublicHookApi = {
    useFieldState: {} as {
      array: typeof featureInitialState.array;
      setArray: Setter<typeof featureInitialState.array>;
      string: typeof featureInitialState.string;
      setString: Setter<typeof featureInitialState.string>;
    },
  };

  const secondTestedComponentPublicHookApi = {
    useFieldGetter: {} as {
      string: typeof featureInitialState.string;
    },
    useFieldSetter: {} as {
      setString: Setter<typeof featureInitialState.string>;
    },
  };

  return {
    featureInitialState,
    testedFeature,
    firstTestedComponentPublicHookApi,
    secondTestedComponentPublicHookApi,
    renderComponents,
    store,
  };
};

export const getCustomPathTestedEntities = () => {
  const testedFeature = createFeature('test', featureInitialState, {
    featureSelector: (state) => state.feature.test,
  });
  const store = createStore(
    combineReducers({
      feature: combineReducers({ ...testedFeature.getReducer() }),
    })
  );

  return {
    featureInitialState,
    testedFeature,
    store,
  };
};

type Setter<T> = (payload: T | ((arg: T) => T)) => {
  type: string;
  payload: T | ((arg: T) => void);
};
