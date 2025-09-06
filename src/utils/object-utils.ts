// Polyfill for Object.groupBy
if (!Object.groupBy) {
  Object.groupBy = function (array: any[], callbackFn: (item: any) => string) {
    return array.reduce((acc, obj) => {
      const key = callbackFn(obj);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  };
}

declare global {
  interface ObjectConstructor {
    groupBy<T>(items: T[], callbackFn: (item: T) => string): { [key: string]: T[] };
  }
}

export {};
