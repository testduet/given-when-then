export default function isPromise(promise: unknown): promise is Promise<unknown> {
  return !!promise && typeof promise === 'object' && 'then' in promise && typeof promise.then === 'function';
}
