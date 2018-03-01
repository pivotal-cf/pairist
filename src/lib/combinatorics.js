export const pairs = (array) => {
  let results = []

  for (let i = 0; i < array.length - 1; i++) {
    // This is where you'll capture that last value
    for (let j = i + 1; j < array.length; j++) {
      results.push([array[i], array[j]])
    }
  }
  return results
}

export const pairings = (array) => {
  if (array.length % 2 === 1) {
    array.push(null)
  }

  if (array.length === 2) {
    return [array]
  }

  let results = []

  for (let i = 1; i < array.length; i++) {
    const buff = array[1]
    array[1] = array[i]
    array[i] = buff
    const more = pairings(array.slice(2))

    for (let j = 0; j < more.length; j++) {
      results.push(array.slice(0, 2).concat(more[j]))
    }
  }

  return results
}
