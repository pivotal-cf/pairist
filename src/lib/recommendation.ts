// @ts-nocheck

import bigInt from 'big-integer';
import { combination, permutation } from 'js-combinatorics';
import _clone from 'lodash/clone';
import _difference from 'lodash/difference';
import _flatten from 'lodash/flatten';
import _groupBy from 'lodash/groupBy';
import _head from 'lodash/head';
import _map from 'lodash/map';
import _mapValues from 'lodash/mapValues';
import _without from 'lodash/without';
import _tail from 'lodash/tail';
import _remove from 'lodash/remove';
import _last from 'lodash/last';
import _shuffle from 'lodash/shuffle';
import _some from 'lodash/some';
import _concat from 'lodash/concat';
import munkres from 'munkres-js';
import { pairs } from './combinatorics';
import constants from './constants';

export const getMoves = ({ match, lanes }) => {
  if (match === undefined) {
    return [];
  }
  const moves = match
    .map(([pair, key]) => {
      return {
        lane: key,
        entities: pair.filter((p) => {
          return key === 'new-lane' || lanes[key].length === 0 || !lanes[key].includes(p);
        }),
      };
    })
    .filter((p) => p.entities.length);
  return moves;
};

export const scoreMatrix = (left, right, history, maxScore) => {
  const scores = {};

  left.forEach((l) => {
    scores[l] = {};
    right.forEach((r) => {
      scores[l][r] = bigInt(maxScore);
    });
  });

  history.forEach((h) => {
    h.lanes.forEach((lane) => {
      lane.left.forEach((l) => {
        lane.right.forEach((r) => {
          if (scores[l] && scores[l][r] !== undefined) {
            scores[l][r] = l !== r ? h.score : bigInt(1);
          }
        });
      });
    });
  });

  return left.map((l, i) =>
    right.map((r, j) => {
      return scores[l][r];
    })
  );
};

const applyAffinities = ({ peopleKeys, people, rawScores }) => {
  let scores = _clone(rawScores);
  for (let person of people) {
    if (person.affinities !== undefined) {
      if (person.affinities.none !== undefined) {
        const peopleToAvoid = people.filter((p) =>
          _some(
            person.affinities.none,
            (affinity) => p.tags !== undefined && p.tags.includes(affinity)
          )
        );
        peopleToAvoid.forEach((personToAvoid) => {
          const leftIndex = peopleKeys.indexOf(key(person));
          const rightIndex = peopleKeys.indexOf(key(personToAvoid));
          scores[leftIndex][rightIndex] = bigInt(0);
          scores[rightIndex][leftIndex] = bigInt(0);
        });
      }
    }
  }
  return rawScores;
};

export const mergePairsScores = (scores, pairs) => {
  const merged = [];
  pairs.forEach((pair) => {
    merged.push(
      scores[pair[0]].map((score, i) => {
        let other = score;
        if (pair[1]) {
          other = scores[pair[1]][i];
        }
        return score + other;
      })
    );
  });
  return merged;
};

const key = (e) => e['.key'];

export const allPossibleAssignments = function* ({ current }) {
  const laneKeys = current.lanes.filter((l) => !l.locked).map(key);
  const people = _shuffle(
    current.entities.filter(
      (e) =>
        e.type === 'person' &&
        (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
    )
  );
  const assignments = _map(
    _mapValues(_groupBy(people, 'location'), (v) => v.map(key)),
    (l, p) => [p, l]
  );
  let unassigned = _remove(assignments, (as) => as[0] === 'unassigned')[0];
  if (unassigned === undefined) {
    unassigned = [];
  } else {
    unassigned = unassigned[1];
  }
  if (people.length % 2 === 1) {
    unassigned.push('<solo>');
  }
  const totalLanes = people.length % 2 === 1 ? (people.length + 1) / 2 : people.length / 2;

  const emptyLanes = _difference(
    laneKeys,
    people.map((p) => p.location)
  );

  const generateUniqPairings = function* ({ unassigned, remainingLaneCount }) {
    const unassignedPeople = combination(unassigned, remainingLaneCount * 2);
    let unassignedGroup = unassignedPeople.next();
    while (unassignedGroup !== undefined) {
      const combinationsOfPeople = combination(unassignedGroup, 2).map((c) => c);
      const combinationTracker = combinationsOfPeople.reduce((combos, pair) => {
        if (combos[pair[0]] === undefined) {
          combos[pair[0]] = {};
        }
        combos[pair[0]][pair[1]] = false;
        return combos;
      }, {});
      for (const c of combinationsOfPeople) {
        if (combinationTracker[c[0]][c[1]] === true) {
          return;
        }

        const thisSet = [];
        thisSet.push(c);
        combinationTracker[c[0]][c[1]] = true;
        while (thisSet.length < remainingLaneCount) {
          const idx = combinationsOfPeople.findIndex((c) =>
            c.every((p) => thisSet.every((pair) => !pair.includes(p)))
          );
          const next = combinationsOfPeople[idx];
          thisSet.push(next);
          combinationTracker[next[0]][next[1]] = true;
        }

        yield thisSet;
      }
      unassignedGroup = unassignedPeople.next();
    }
  };

  const generateLaneSynthesizers = function* ({
    currentLaneChoices,
    currentAssignment,
    remainingAssignments,
    wrapUp,
    unassigned,
    remainingLaneCount,
  }) {
    const processSetting = function* ([person, newUnassigned, i]) {
      const wrapUpThisLevel = function* ({ tailAssignments }) {
        while (tailAssignments.length > 0) {
          const assignment = tailAssignments.pop();
          for (let j = 0; j < assignment.unassigned.length; j++) {
            const unassignedPerson = assignment.unassigned[j];
            if (i > 0 && currentAssignment[1].includes(unassignedPerson)) {
              return;
            }

            yield* wrapUp({
              tailAssignments: [
                {
                  results: assignment.results.concat([
                    [[person, unassignedPerson], currentAssignment[0]],
                  ]),
                  unassigned: _difference(assignment.unassigned, [unassignedPerson]),
                },
              ],
            });
          }
        }
      };

      yield {
        remainingAssignments: _tail(remainingAssignments),
        unassigned: _concat(unassigned, newUnassigned),
        remainingLaneCount: remainingLaneCount - 1,
        wrapUp: wrapUpThisLevel,
      };
    };

    while (currentLaneChoices.length > 0) {
      yield* processSetting(currentLaneChoices.shift());
    }
  };

  const wrapperUpper = function* (nextGenerator) {
    const wrapItem = function* ({ remainingAssignments, unassigned, wrapUp, remainingLaneCount }) {
      if (remainingAssignments.length === 0) {
        if (remainingLaneCount === 0) {
          yield* wrapUp({ tailAssignments: [{ results: [], unassigned: unassigned }] });
        } else {
          const uniqNewPairings = generateUniqPairings({ unassigned, remainingLaneCount });
          let nextPairing = uniqNewPairings.next();
          while (!nextPairing.done) {
            const pairing = nextPairing.value;
            let lanePermutations = [emptyLanes];
            if (emptyLanes.length > 0) {
              lanePermutations = permutation(emptyLanes).toArray();
            }
            for (let lanes of lanePermutations) {
              while (lanes.length < pairing.length) {
                lanes.push('new-lane');
              }
              yield* wrapUp({
                tailAssignments: [
                  {
                    results: lanes.map((l, i) => [pairing[i], l]),
                    unassigned: _difference(unassigned, _flatten(pairing)),
                  },
                ],
              });
            }
            nextPairing = uniqNewPairings.next();
          }
        }
      }
    };

    for (let nextItem of nextGenerator) {
      yield* wrapItem(nextItem);
    }
  };

  const generateSubAssignments = function* ({
    remainingAssignments,
    unassigned,
    wrapUp,
    remainingLaneCount,
  }) {
    if (remainingAssignments.length > 0) {
      const currentAssignment = _head(remainingAssignments);
      const currentLaneChoices = currentAssignment[1].map((person, i) => [
        person,
        _difference(currentAssignment[1], [person]),
        i,
      ]);

      for (let synthesizer of generateLaneSynthesizers({
        currentLaneChoices,
        currentAssignment,
        remainingAssignments,
        wrapUp,
        unassigned,
        remainingLaneCount,
      })) {
        yield synthesizer;
        if (synthesizer.remainingAssignments.length > 0) {
          yield* generateSubAssignments(synthesizer);
        }
      }
    }
  };

  const innerFindAssignments = function* ({
    initialAssignments,
    wrapUp,
    unassigned,
    remainingLaneCount,
  }) {
    const firstItem = {
      remainingAssignments: initialAssignments,
      unassigned: unassigned,
      wrapUp,
      remainingLaneCount: remainingLaneCount,
    };

    let settingGenerator = generateSubAssignments(firstItem);
    let next = settingGenerator.next();
    do {
      let nextItem = next.value;
      yield* wrapperUpper(nextItem === undefined ? [firstItem] : [nextItem]);
      next = settingGenerator.next();
    } while (!next.done);
  };

  yield* innerFindAssignments({
    initialAssignments: assignments,
    unassigned,
    remainingLaneCount: totalLanes,
    wrapUp: function* ({ tailAssignments }) {
      while (tailAssignments.length > 0) {
        const nextAssignment = tailAssignments.pop();
        yield nextAssignment.results.map((as) => [_without(as[0], '<solo>'), as[1]]);
      }
    },
  });
};

export const calculateMovesToBestPairing = ({ current, history }) => {
  const laneKeys = current.lanes.filter((l) => !l.locked).map(key);
  let optimizedHistory = [];
  const people = current.entities.filter(
    (e) =>
      e.type === 'person' &&
      (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  );

  if (2 * laneKeys.length - 1 > people.length) {
    return null;
  }

  const peopleKeys = people.map(key);
  if (peopleKeys.length % 2 === 1) {
    peopleKeys.push('<solo>');
  }
  const lanes = Object.assign(
    ...laneKeys.map((key) => ({ [key]: [] })),
    _mapValues(
      _groupBy(
        people.filter((e) => laneKeys.includes(e.location)),
        'location'
      ),
      (v) => v.map(key)
    )
  );

  if (peopleKeys.length === 0) {
    return [];
  }

  let maxScore = 0;

  if (history && history.length > 0) {
    maxScore = bigInt(parseInt(_last(history)['.key']));

    optimizedHistory = history.map((h) => {
      const groups = _groupBy(
        h.entities.filter(
          (e) =>
            e.type === 'person' &&
            e.location !== constants.LOCATION.UNASSIGNED &&
            e.location !== constants.LOCATION.OUT
        ),
        'location'
      );
      const lanes = [];
      const score = bigInt(maxScore).subtract(parseInt(h['.key']));

      Object.values(groups).forEach((people) => {
        people = people.map(key);
        if (people.length === 1) {
          people.push('<solo>');
        }

        lanes.push({
          left: people,
          right: people,
        });
      });
      return { score, lanes };
    });
  } else {
    optimizedHistory = [];
  }

  const rawScores = scoreMatrix(peopleKeys, peopleKeys, optimizedHistory, maxScore + 1);
  const scores = applyAffinities({ peopleKeys, people, rawScores });

  // set pairing solos to lowest possible score
  const solos = _flatten(Object.values(lanes).filter((l) => l.length === 1)).map((p) =>
    peopleKeys.indexOf(p)
  );
  pairs(solos).forEach((p) => {
    scores[p[0]][p[1]] = bigInt(-1);
    scores[p[1]][p[0]] = bigInt(-1);
  });
  const pairKeyIndices = peopleKeys
    .map((key, i) => [key, i])
    .reduce((keysIndices, [key, i]) => {
      keysIndices[key] = i;
      return keysIndices;
    }, {});

  const assts = allPossibleAssignments({ current });
  let nextAssignment = assts.next();
  if (nextAssignment.done) {
    return [];
  }
  let bestPairing = nextAssignment.value;

  let highestScore = bestPairing.reduce((sum, a) => {
    const pair = a[0];
    const lane = a[1];
    return sum.add(scoreAssignment({ pair, lane, pairKeyIndices, scores }));
  }, bigInt(0));

  let assignment = bestPairing;
  while (!nextAssignment.done) {
    assignment = nextAssignment.value;

    const pairScore = assignment.reduce((sum, a) => {
      const pair = a[0];
      const lane = a[1];
      return sum.add(scoreAssignment({ pair, lane, pairKeyIndices, scores }));
    }, bigInt(0));

    if (pairScore > highestScore) {
      bestPairing = assignment;
      highestScore = pairScore;
    }
    nextAssignment = assts.next();
  }

  return getMoves({ match: bestPairing, lanes });
};

const scoreAssignment = ({ pair, lane, pairKeyIndices, scores }) => {
  const firstPerson = pairKeyIndices[pair[0]];
  let secondPerson = firstPerson;
  if (pair[1] !== undefined) {
    secondPerson = pairKeyIndices[pair[1]];
  }
  const pairScore = scores[firstPerson][secondPerson];

  return pairScore;
};

export const calculateMovesToBestAssignment = ({ left, right, current, history }) => {
  const laneKeys = current.lanes.filter((l) => !l.locked).map(key);
  const leftEntities = current.entities.filter(
    (e) => e.type === left && laneKeys.includes(e.location)
  );
  const rightEntities = current.entities.filter(
    (e) =>
      e.type === right &&
      (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  );

  const leftKeys = leftEntities.map(key);
  const rightKeys = rightEntities.map(key);

  if (leftKeys.length === 0) {
    return [];
  }

  let maxScore = 0;

  if (history && history.length > 0) {
    maxScore = parseInt(_last(history)['.key']);

    history = history.map((h) => {
      const groups = _groupBy(
        h.entities.filter(
          (e) =>
            e.location !== constants.LOCATION.UNASSIGNED && e.location !== constants.LOCATION.OUT
        ),
        'location'
      );
      const lanes = [];
      const score = maxScore - parseInt(h['.key']);

      Object.values(groups).forEach((entities) => {
        entities = entities.map(key);

        lanes.push({
          left: entities.filter((e) => e.type === left),
          right: entities.filter((e) => e.type === right),
        });
      });
      return { score, lanes };
    });
  } else {
    history = [];
  }

  const scores = scoreMatrix(leftKeys, rightKeys, history, maxScore + 1);
  let pairs = Object.values(
    _groupBy(
      leftEntities.filter((e) => e.location !== constants.LOCATION.OUT),
      'location'
    )
  ).map((p) => p.map((e) => leftKeys.indexOf(key(e))));
  let mergedScores = mergePairsScores(scores, pairs);

  while (pairs.length < rightKeys.length) {
    pairs = pairs.concat(pairs);
    mergedScores = mergedScores.concat(mergedScores);
  }

  const assignment = munkres(munkres.make_cost_matrix(mergedScores)).map((a) => [
    pairs[a[0]],
    rightKeys[a[1]],
  ]);

  const results = [];
  assignment.forEach((a) => {
    const lane = leftEntities.find((e) => e['.key'] === leftKeys[a[0][0]]).location;
    if (rightEntities.find((e) => e['.key'] === a[1]).location !== lane) {
      results.push({
        lane,
        entities: [a[1]],
      });
    }
  });
  return results;
};
