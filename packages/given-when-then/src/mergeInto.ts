export default function mergeInto<T, TMerge>(objectToMerge: TMerge): (scope: T) => T & TMerge {
  return scope => ({ ...scope, ...objectToMerge });
}
