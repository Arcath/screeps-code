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

module.exports = constants
