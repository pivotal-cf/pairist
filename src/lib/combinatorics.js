function permutations(array) {
  var permArr = [],
    usedChars = []

  function permute(input) {
    var i, ch
    for (i = 0; i < input.length; i++) {
      ch = input.splice(i, 1)[0]
      usedChars.push(ch)
      if (input.length == 0) {
        permArr.push(usedChars.slice())
      }
      permute(input)
      input.splice(i, 0, ch)
      usedChars.pop()
    }
    return permArr
  }

  return permute(array)
}

function pairs(array) {
  let results = []

  for (let i = 0; i < array.length - 1; i++) {
    // This is where you'll capture that last value
    for (let j = i + 1; j < array.length; j++) {
      results.push([array[i], array[j]])
    }
  }
  return results
}

module.exports = {permutations, pairs}
