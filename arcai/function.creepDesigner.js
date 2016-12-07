module.exports = {
  createCreep: function(options){
    if(!options.extend){
      options.extend = options.base
    }

    if(options.canAffordOnly){
      var canSpend = options.room.energyAvailable
    }else{
      var canSpend = options.room.energyCapacityAvailable
    }

    if(canSpend > options.cap){
      var canSpend = options.cap
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

    for(var part in creep){
      cost += BODYPART_COST[creep[part]]
    }

    return cost
  },

  baseDesign: {
    harvest: [WORK, WORK, CARRY, MOVE],
    upgrade: [WORK, CARRY, MOVE],
    haul: [CARRY, CARRY, MOVE],
    build: [WORK, WORK, CARRY, MOVE],
    mineralHarvest: [WORK, WORK, CARRY, MOVE],
    supply: [CARRY, CARRY, MOVE],
    construct: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
  },

  caps: {
    harvest: 1200,
    upgrade: 800,
    haul: 750,
    build: 1200,
    mineralHarvest: 1200,
    supply: 750,
    construct: 1400
  }
}
