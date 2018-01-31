interface PartList{
  [name: string]: BodyPartConstant[]
}

interface WeightList{
  [part: string]: number
}

import {Kernel} from '../os/kernel'

export const CreepBuilder = {
  build(creepType: string, spendCap: number){
    let body = <BodyPartConstant[]>[].concat(<never[]>CreepBuilder.typeStarts[creepType])
    let add = true
    let extendIndex = 0
    let creepCost = 0

    while(add){
      creepCost = CreepBuilder.bodyCost(body)

      let nextPart = CreepBuilder.typeExtends[creepType][extendIndex]

      if(
        creepCost + BODYPART_COST[nextPart] > spendCap
        ||
        body.length === CreepBuilder.typeLengths[creepType]
      ){
        add = false
      }else{
        body.push(CreepBuilder.typeExtends[creepType][extendIndex])
        extendIndex += 1
        if(extendIndex === CreepBuilder.typeExtends[creepType].length){
          extendIndex = 0
        }
      }
    }

    return {
      body: _.sortBy(body, function(part){
        return CreepBuilder.partWeight[part]
      }),
      cost: creepCost
    }
  },

  design: function(creepType: string, room: Room, kernel: Kernel){
    let body = <BodyPartConstant[]>[].concat(<never[]>CreepBuilder.typeStarts[creepType])
    let spendCap

    let creepCount = 0
    let proc = kernel.getProcessByName('em-' + room.name)
    if(proc){
      _.forEach(Object.keys(proc.metaData.harvestCreeps), function(sourceId: string){
        creepCount += proc.metaData.harvestCreeps[sourceId].length
      })
    }
    let emergancy = (creepType === 'harvester' && creepCount === 0)

    if(room.storage){
      if(proc && !proc.metaData.distroCreeps[room.storage.id] && creepType === 'mover'){
        emergancy = true
      }
    }

    if(emergancy){
      spendCap = room.energyAvailable
    }else{
      spendCap = room.energyCapacityAvailable
    }

    let add = true
    let extendIndex = 0

    while(add){
      var creepCost = CreepBuilder.bodyCost(body)

      var nextPart = CreepBuilder.typeExtends[creepType][extendIndex]

      if(
        creepCost + BODYPART_COST[nextPart] > spendCap
        ||
        body.length === CreepBuilder.typeLengths[creepType]
      ){
        add = false
      }else{
        body.push(CreepBuilder.typeExtends[creepType][extendIndex])
        extendIndex += 1
        if(extendIndex === CreepBuilder.typeExtends[creepType].length){
          extendIndex = 0
        }
      }
    }

    return _.sortBy(body, function(part){
      return CreepBuilder.partWeight[part]
    })
  },

  bodyCost: function(body: BodyPartConstant[]){
    let cost = 0

    for(let part in body){
      cost += BODYPART_COST[body[part]]
    }

    return cost
  },

  partWeight: <WeightList>{
    'attack': 15,
    'carry': 8,
    'claim': 9,
    'heal': 20,
    'move': 5,
    'ranged_attack': 14,
    'tough': 1,
    'work': 10
  },

  typeStarts: <PartList>{
    'claimer': [CLAIM, MOVE],
    'defender': [RANGED_ATTACK, MOVE],
    'harvester': [WORK, WORK, CARRY, MOVE],
    'hold': [CLAIM, CLAIM, MOVE, MOVE],
    'mover': [CARRY, MOVE],
    'bunkerMover': [MOVE, CARRY],
    'ranger': [RANGED_ATTACK, TOUGH, MOVE, MOVE],
    'worker': [WORK, CARRY, MOVE, MOVE],
    'transporter': [CARRY, MOVE],
    'upgrader': [WORK, CARRY, MOVE, MOVE],
    'scout': [MOVE],
    'remoteHarvester': [WORK, WORK, CARRY, MOVE, MOVE, MOVE]
  },

  typeExtends: <PartList>{
    'claimer': [MOVE],
    'defender': [RANGED_ATTACK, MOVE],
    'harvester': [WORK, MOVE],
    'hold': [],
    'mover': [CARRY, MOVE],
    'bunkerMover': [CARRY],
    'ranger': [RANGED_ATTACK, TOUGH, MOVE, MOVE, HEAL],
    'worker': [WORK, CARRY, MOVE, MOVE],
    'transporter': [CARRY, MOVE],
    'upgrader': [WORK, CARRY, MOVE],
    'scout': [],
    'remoteHarvester': [WORK, MOVE]
  },

  typeLengths: <{[name: string]: number}>{
    'claimer': 5,
    'defender': 20,
    'harvester': 12,
    'hold': 4,
    'mover': 20,
    'bunkerMover': 17,
    'ranger': 35,
    'worker': 16,
    'transporter': 28,
    'upgrader': 24,
    'scout': 1,
    'remoteHarvester': 14
  }
}
