export const pairs = (array) => {
  let results = [];

  for (let i = 0; i < array.length - 1; i++) {
    for (let j = i + 1; j < array.length; j++) {
      results.push([array[i], array[j]]);
    }
  }
  return results;
};

export const pairings = function* (array) {
  if (array.length === 2) {
    yield [array];
    return;
  }

  for (let i = 1; i < array.length; i++) {
    const buff = array[1];
    array[1] = array[i];
    array[i] = buff;
    const result = [array.slice(0, 2)];

    for (let more of pairings(array.slice(2))) {
      yield result.concat(more);
    }
  }
};
