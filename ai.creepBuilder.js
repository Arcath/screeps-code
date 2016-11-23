module.exports = {
  createCreep: function(options){
    if(!options.extend){
      options.extend = options.base
    }

    var targets = options.spawn.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION)
        }
    })
    
    if(options.canAffordOnly){
        var canSpend = options.spawn.energy
        for(target in targets){
            canSpend += targets[target].energy
        }
        console.log(canSpend)
    }else{
        var canSpend = 300 + (50 * targets.length)
    }

    var creep = options.base
    var add = true
    var extendIndex = 0

    while(add){
      var creepCost = this.creepCost(creep)

      var nextPart = options.extend[extendIndex]

      if(creepCost + BODYPART_COST[nextPart] > canSpend){
        add = false
      }else{
        creep.push(options.extend[extendIndex])
        extendIndex += 1
        if(extendIndex == options.extend.length){
          extendIndex = 0
        }
      }
    }

    return creep
  },

  creepCost: function(creep){
    var cost = 0

    for(part in creep){
      cost += BODYPART_COST[creep[part]]
    }

    return cost
  }
}
