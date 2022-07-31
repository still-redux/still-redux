import produce from 'immer';
import { AnyAction, Reducer } from 'redux';

/**
 * Create an object that duplicates the initial state keys and used in special hooks and for auto-generate reducer.
 *
 * ### Example
 * ```js
 * import { createFeature } from 'still-redux'
 *
 * export const todolist = createFeature('todolist', {
 *    items: [{text: 'add todos', completed: false}],
 *    title: 'my todolist',
 * })
 * ```
 *
 * @param featureName - unique feature name, used as reducer name.
 * @param initialState - the initial feature state.
 * @param options - optional feature options.
 * @param options.featureSelector - optional feature store selector. Define it if you are using a nested store structure, for example: (state) => state.feature.subFeature. If featureSelector is not set, path state[featureName] will be used.
 * @returns cool feature.
 */
export const createFeature = <
  FeatureName extends string,
  FeatureState extends Record<string, unknown>
>(
  featureName: FeatureName,
  initialState: FeatureState,
  options?: FeatureOptions
) => {
  const keys: (keyof FeatureState)[] = Object.keys(initialState);
  const reducerCases = {} as Record<
    string,
    (state: FeatureState, payload: unknown) => void
  >;
  const featureApi = {} as {
    [K in keyof FeatureState]: {
      selector: <RootState extends object>(state: RootState) => FeatureState[K];
      actionCreator: (
        payload: FeatureState[K] | ((arg: FeatureState[K]) => FeatureState[K])
      ) => {
        type: string;
        payload: FeatureState[K] | ((arg: FeatureState[K]) => void);
      };
    };
  };
  keys.forEach((key) => {
    if (key === GET_REDUCER_KEY) {
      throw new Error(
        `${GET_REDUCER_KEY} is reserved key name, use another naming please`
      );
    }
    const actionName = `${featureName}:${key as string}:set`.toUpperCase();
    featureApi[key] = {
      selector: (state) =>
        options?.featureSelector?.(state)[key] ||
        (state as Record<FeatureName, FeatureState>)[featureName][key],
      actionCreator: (payload) => ({ type: actionName, payload }),
    };
    featureApi[key].actionCreator.toString = () => actionName;
    reducerCases[actionName] = (
      state: FeatureState,
      payload:
        | unknown
        | ((value: FeatureState[typeof key]) => FeatureState[typeof key])
    ) => {
      state[key] =
        typeof payload === 'function' ? payload(state[key]) : payload;
    };
  });
  const reducer = {
    [featureName]: (state = initialState, action: AnyAction) =>
      produce(state, (draft) => {
        if (!(action.type in reducerCases)) {
          return;
        }
        reducerCases[action.type](draft as FeatureState, action.payload);
      }),
  };
  // @ts-ignore
  featureApi[GET_REDUCER_KEY] = () => reducer;
  return featureApi as typeof featureApi & {
    getReducer: () => Record<FeatureName, Reducer<FeatureState>>;
  };
};

const GET_REDUCER_KEY = `getReducer`;

interface FeatureOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featureSelector?: (state: any) => any;
}
