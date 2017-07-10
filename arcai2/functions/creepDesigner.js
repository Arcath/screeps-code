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

    var creep = [].concat(options.base)
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
    slowWork: [WORK, WORK, CARRY, MOVE],
    fastWork: [WORK, CARRY, MOVE],
    move: [CARRY, CARRY, MOVE],
    damage: [TOUGH, MOVE, ATTACK, ATTACK],
    claim: [CLAIM, MOVE, MOVE, MOVE, MOVE],
    upgrader: [WORK, CARRY, MOVE, MOVE, MOVE],
    moveWork: [WORK, CARRY, MOVE]
  },

  extend: {
    slowWork: [WORK],
    upgrader: [WORK],
    moveWork: [CARRY, CARRY, MOVE]
  },

  caps: {
    slowWork: 1200,
    fastWork: 1200,
    move: 750,
    damage: 1200,
    claim: 800,
    upgrader: 1700,
    moveWork: 850
  }
}
