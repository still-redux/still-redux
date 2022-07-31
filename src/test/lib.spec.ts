import * as rtl from '@testing-library/react';
import test from 'ava';
import { createFeature } from '../lib/createFeature';
import { getBaseTestedEntities } from './preparation';

const {
  featureInitialState,
  firstTestedComponentPublicHookApi,
  secondTestedComponentPublicHookApi,
  renderComponents,
} = getBaseTestedEntities();

test.beforeEach(() => {
  renderComponents();
});

test.afterEach(() => {
  rtl.cleanup();
});

test('useFieldState selector for initial state works correctly', (t) => {
  t.deepEqual(
    firstTestedComponentPublicHookApi.useFieldState.array,
    featureInitialState.array
  );
});

test('useFieldState set by value works correctly', (t) => {
  const updatedArrayValue = [{ foo: 'bar2' }, { foo: 'bar3' }];
  rtl.act(() => {
    firstTestedComponentPublicHookApi.useFieldState.setArray(updatedArrayValue);
  });
  t.deepEqual(
    firstTestedComponentPublicHookApi.useFieldState.array,
    updatedArrayValue
  );
});

test('useFieldState set by fn works correctly', (t) => {
  rtl.act(() => {
    firstTestedComponentPublicHookApi.useFieldState.setArray((items) => {
      return items.filter((item) => item.foo === 'bar3');
    });
  });
  t.deepEqual(firstTestedComponentPublicHookApi.useFieldState.array, [
    { foo: 'bar3' },
  ]);
});

test('useFieldState select for another field works correctly', (t) => {
  t.is(
    firstTestedComponentPublicHookApi.useFieldState.string,
    featureInitialState.string
  );
});

test('useFieldState set for another field works correctly', (t) => {
  rtl.act(() => {
    firstTestedComponentPublicHookApi.useFieldState.setString('string2');
  });
  t.is(firstTestedComponentPublicHookApi.useFieldState.string, 'string2');
});

test('useFieldGetter works correctly', (t) => {
  t.is(secondTestedComponentPublicHookApi.useFieldGetter.string, 'string2');
});

test('useFieldSetter by value works correctly', (t) => {
  rtl.act(() => {
    secondTestedComponentPublicHookApi.useFieldSetter.setString('string3');
  });
  t.is(firstTestedComponentPublicHookApi.useFieldState.string, 'string3');
});

test('useFieldSetter by fn works correctly', (t) => {
  rtl.act(() => {
    secondTestedComponentPublicHookApi.useFieldSetter.setString(
      (currentString) => currentString.repeat(2)
    );
  });
  t.is(
    firstTestedComponentPublicHookApi.useFieldState.string,
    'string3string3'
  );
});

test('should throw error if feature contains reserved getReducer key', (t) => {
  const error = t.throws(() =>
    createFeature('test', { getReducer: 'reserved' })
  );
  t.true(error.message.length > 0);
});
