import { useDispatch, useSelector } from 'react-redux';

export const useFieldSetter = <S extends AnyFn, AC extends AnyFn>({
  actionCreator,
}: SelectorAndActionCreator<S, AC>): AC => {
  const dispatch = useDispatch();
  return ((value: Parameters<AC>) => dispatch(actionCreator(value))) as AC;
};

export const useFieldGetter = <S extends AnyFn, AC extends AnyFn>({
  selector,
}: SelectorAndActionCreator<S, AC>): ReturnType<S> => {
  return useSelector(selector);
};

export const useFieldState = <S extends AnyFn, AC extends AnyFn>({
  selector,
  actionCreator,
}: SelectorAndActionCreator<S, AC>): [ReturnType<S>, AC] => {
  const vale = useFieldGetter({ selector, actionCreator });
  const set = useFieldSetter({ selector, actionCreator });
  return [vale, set as AC];
};

type SelectorAndActionCreator<S extends AnyFn, AC extends AnyFn> = {
  selector: S;
  actionCreator: AC;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;
