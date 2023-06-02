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
  }
};