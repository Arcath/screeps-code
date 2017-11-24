export class CreepTalk{
  overrideFunctions = [
    'attack',
    'attackController',
    'build',
    'claimController',
    'dismantle',
    'drop',
    'harvest',
    'heal',
    'move',
    'pickup',
    'rangedAttack',
    'rangedHeal',
    'rangedMassAttack',
    'repair',
    'reserveController',
    'suicide',
    'transfer',
    'upgradeController',
    'signController',
    'withdraw'
  ]

  constructor(options: CreepTalkOptions){
    this.registerCreepFunctions(options)
  }

  wrapFunction(name: string, originalFunction: any, options: CreepTalkOptions, languagePack: CreepTalkLanguage){
    return function wrappedFunction(this: Creep) {
      if(!!this.talk) {
        this.talk(name, !!options.public, languagePack)
      }
      return originalFunction.apply(this, arguments);
    };
  }

  registerCreepFunctions(options: CreepTalkOptions){
    let language_pack: CreepTalkLanguage = {}
    try {
      if(!!options.language) {
        if(typeof options.language === 'string') {
          language_pack = require('creeptalk_' + options.language)
        } else {
          language_pack = options.language
        }
      }
    } catch (err) {
      console.log('Unable to load language pack ' + options.language)
      return
    }

    for(var function_name of this.overrideFunctions) {
      Creep.prototype[function_name] = this.wrapFunction(function_name, Creep.prototype[function_name], options, language_pack)
    }

    Creep.prototype.talk = function (group, pub, language_pack) {
      try {
        let speech: boolean | CreepTalkLanguageEntry

        if(!!language_pack[group] && language_pack[group].length > 0) {
          speech = language_pack[group]
        } else if (!!language_pack['default'] && language_pack['default'].length > 0) {
          speech = language_pack['default']
        } else {
          speech = false
        }

        if(!!speech) {
          if(typeof speech === 'string') {
            var string = speech
          } else if(typeof speech === 'function') {
            var string = <string>speech(this)
          } else {
            var string = speech[Math.floor(Math.random()*speech.length)];
          }
          if(!!string) {
            this.say(string, pub)
          }
        }
      } catch (err) {}
    }
  }
}
