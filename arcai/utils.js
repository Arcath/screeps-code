module.exports = {
  ensureRoom: function(room){
    if(!Memory.arc){
      Memory.arc = {}
    }

    if(!Memory.arc[room]){
      Memory.arc[room] = {}
    }
  },

  inflate: function(room, key, create, force = false){
    this.ensureRoom(room.name)

    if(!Memory.arc[room.name][key] || force){
      var returnData = create(room)

      Memory.arc[room.name][key] = []
      for(var i in returnData){
        Memory.arc[room.name][key].push(returnData[i].id)
      }
    }else{
      var returnData = []

      for(var i in Memory.arc[room.name][key]){
        var id = Memory.arc[room.name][key][i]

        returnData.push(Game.getObjectById(id))
      }
    }

    return returnData
  },

  energyAfterDeliveries: function(structure){
    var creeps = _.filter(Memory.creeps, function(mem){
      return (mem.deliverTo == structure.id)
    })

    if(structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER){
      var current = structure.energy
      var max = structure.energyCapacity
    }else{
      var current = _.sum(structure.store)
      var max = structure.storeCapacity
    }

    if(creeps.length){
      for(var i in creeps){
        var creep = creeps[i]

        if(creep.carry){
          current += creep.carry.energy
        }
      }
    }

    return current
  },

  shouldDeliverTo: function(creep, structure){
    var energy = this.energyAfterDeliveries(structure)

    if(structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER){
      var max = structure.energyCapacity
    }else{
      var max = structure.storeCapacity
    }

    return (energy < max)
  }
}
