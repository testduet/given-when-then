export default function isPromiseLike(promise: unknown): promise is PromiseLike<unknown> {
  return !!promise && typeof promise === 'object' && 'then' in promise && typeof promise.then === 'function';
}
