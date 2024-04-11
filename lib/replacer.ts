export const Replacer = {
  replace: (source: string, regexp: RegExp, rule: (value: string) => string): string => {
    const matches = source.match(regexp);
    if (matches?.length) {
      for (const match of matches) {
        source = source.replaceAll(match, rule(match));
      }
    }
    return source;
  },

  splitTextIntoParts: (rawData: string, regexp: RegExp): Record<string, string> => rawData
    .split(regexp)
    .reduce((obj, current, index, array) => {
      if (index % 2 === 1) {
        obj[current.toLowerCase()] = array[index + 1]?.trim();
      }
      return obj;
    }, {} as Record<string, string>),

  toArray: <T>(val?: T | T[]): T[] => (Array.isArray(val) ? val : [val as T]).filter(Boolean),

  newLineRegexp: /\r\n|\r|\n/g
};
