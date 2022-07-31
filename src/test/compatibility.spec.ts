import test from 'ava';
import {
  getBaseTestedEntities,
  getCustomPathTestedEntities,
} from './preparation';

const { testedFeature, featureInitialState, store } = getBaseTestedEntities();

const {
  testedFeature: testedFeatureCustomPath,
  featureInitialState: featureInitialStateCustomPath,
  store: storeCustomPath,
} = getCustomPathTestedEntities();

test('selector works correctly', (t) => {
  const arraySelector = testedFeature.array.selector;
  t.deepEqual(arraySelector(store.getState()), featureInitialState.array);
});

test('selector with custom feature path works correctly', (t) => {
  const arraySelector = testedFeatureCustomPath.array.selector;
  t.deepEqual(
    arraySelector(storeCustomPath.getState()),
    featureInitialStateCustomPath.array
  );
});

// setter type pattern {FEATURE_NAME}:{FEATURE_FIELD}:SET
test('should get type from actionCreator', (t) => {
  const arrayActionCreator = testedFeature.string.actionCreator;
  t.is(arrayActionCreator.toString(), 'TEST:STRING:SET');
});

test('actionCreator by value works correctly', (t) => {
  const arrayActionCreator = testedFeature.array.actionCreator;
  const payload = [{ foo: 'baz' }];
  t.deepEqual(arrayActionCreator(payload), {
    type: arrayActionCreator.toString(),
    payload,
  });
});

test('actionCreator by fn works correctly', (t) => {
  const arrayActionCreator = testedFeature.array.actionCreator;
  const payload = (array: { foo: string }[]) => array.concat({ foo: 'baz' });
  t.deepEqual(arrayActionCreator(payload), {
    type: arrayActionCreator.toString(),
    payload,
  });
});
