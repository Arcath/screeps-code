var ARCRoom = require('object.room')
var report = require('function.report')

module.exports.loop = function(){
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]){
      delete Memory.creeps[name]
      for(var rm in Memory.arc){
        Memory.arc[rm].newCreep = true
      }
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  var rooms = {}

  for(var rm in Game.rooms){
    rooms[rm] = new ARCRoom(rm)
  }

  if(Game.time % 20 ===  0){
    report(rooms)
  }
}
