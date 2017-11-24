
var emoji_language = {

  'attack': [
    'Spawn',
    'More',
    'Overlords',
  ],

  'attackController': [],

  'build': [
    '🚧🚧🚧',
  ],

  'claimController': [
    '✊✊✊✊✊'
  ],

  'dismantle': [
    '💣💣💣💣💣',
  ],

  'drop': [],

  'harvest': [
    '⛏️⛏️⛏️'
  ],

  'heal': [
    '⚕🚑⚕🚑⚕🚑⚕',
    '🚑⚕🚑⚕🚑⚕🚑',
    '⚕⚕⚕⚕⚕⚕⚕⚕⚕⚕',
  ],

  'move': [],

  'pickup': [],

  'rangedAttack': <string[]>[],

  'rangedHeal': <string[]>[],

  'rangedMassAttack': <string[]>[],

  'repair': <string[]>[],

  'reserveController': [
    '🔒🔒🔒',
  ],

  'suicide': [
    '💤💤💤💤💤',
    '♻️♻️♻️♻️♻️'
  ],

  'transfer': [
    '🎁🎁🎁',
  ],

  'upgradeController': [
    '💗☯☸🙌',
    '🙌☯💗☸',
    '☯🙌☸💗',
  ],

  'withdraw': [],

}


emoji_language.rangedAttack = emoji_language.attack
emoji_language.rangedMassAttack = emoji_language.attack
emoji_language.rangedHeal = emoji_language.heal
emoji_language.repair = emoji_language.build

export const CreepTalkEmoji = emoji_language
