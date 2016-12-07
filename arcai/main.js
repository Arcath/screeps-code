var ARCRoom = require('object.room')
var report = require('function.report')

module.exports.loop = function(){
  for(var name in Memory.creeps){
    if(!Game.creeps[name]){
      delete Memory.creeps[name]
      for(var rm in Memory.arc){
        Memory.arc[rm].newCreep = true
      }
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  for(var name in Memory.creeps){
    var creep = Game.creeps[name]

    if(creep.memory.goToRoom){
      if(creep.memory.goToRoom == creep.room.name){
        if(creep.pos.findInRange(FIND_EXIT, 0).length){
          creep.moveTo(creep.room.controller)
        }else{
          creep.memory.goToRoom = undefined
        }
      }
    }
  }

  var rooms = {}

  for(var rm in Game.rooms){
    rooms[rm] = new ARCRoom(rm)
  }

  var needsSupport = []
  var canSupport = []

  for(var rm in rooms){
    if(rooms[rm].needsSupport()){
      needsSupport.push(rm)
    }else{
      if(rooms[rm].canSupport()){
        canSupport.push(rm)
      }
    }
  }

  if(needsSupport.length){
    if(canSupport.length){
      for(var rm in needsSupport){
        for(var t in rooms[needsSupport[rm]].required){
          rooms[needsSupport[rm]].required[t] = rooms[needsSupport[rm]].required[t] - rooms[needsSupport[rm]].creepsByAction[t].length
        }

        for(var crm in canSupport){
          for(var t in rooms[needsSupport[rm]].required){
            rooms[canSupport[crm]].required[t] += rooms[needsSupport[rm]].required[t]

            rooms[canSupport[crm]].countAndEnsureNumbers(t)

            if(rooms[canSupport[crm]].creepsByAction[t][0]){
              rooms[canSupport[crm]].creepsByAction[t][0].memory.goToRoom = needsSupport[rm]
            }
          }
        }
      }
    }
  }

  if(Game.time % 20 ===  0){
    report(rooms)
  }
}
