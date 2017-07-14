var constants = {
  parties: {}
}

constants.parties[COLOR_RED] = [
  [
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    ATTACK,
    ATTACK,
    ATTACK,
    ATTACK,
    ATTACK,
    ATTACK,
    MOVE
  ]
]

constants.parties[COLOR_RED][1]= constants.parties[COLOR_RED][0]
constants.parties[COLOR_RED][2]= constants.parties[COLOR_RED][0]

constants.parties[COLOR_GREEN] = [
  [
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    TOUGH,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    HEAL,
    HEAL,
    HEAL,
    HEAL,
    HEAL,
    HEAL
  ]
]

constants.parties[COLOR_GREEN][1]= constants.parties[COLOR_GREEN][0]
constants.parties[COLOR_GREEN][2]= constants.parties[COLOR_GREEN][0]

module.exports = constants
