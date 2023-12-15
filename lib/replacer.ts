export const Replacer = {
  replaceAllBetween: (source: string, between: [string, string], replaceRule: (value: string) => string): string => {
    const [start, end] = between;
    const parts = source.split(start);
    const firstPart = parts.shift();

    const restParts = parts.map(part => {
      const value = part.split(end)[0];
      return !value ?
        start + part :
        replaceRule(value) + part.substring(value.length + 1);
    });
    return firstPart + restParts.join("");
  },

  splitTextIntoParts: (rawData: string, regexp: RegExp): Record<string, string> => {
    return rawData.split(regexp).reduce((obj, current, index, array) => {
      if (index % 1 === 0) {
        obj[current.toLowerCase()] = array[index + 1];
      }
      return obj;
    }, {});
  },
};