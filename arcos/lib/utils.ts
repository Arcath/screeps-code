import {CreepBuilder} from './creepBuilder'
import {Kernel} from '../os/kernel'
import {Process} from '../os/process'

export const Utils = {
  clearDeadCreeps: function(list: string[]){
    return _.filter(list, function(entry){
      return !!Game.creeps[entry]
    })
  },

  inflateCreeps: function(list: string[]): Creep[]{
    return _.transform(list, function(result, entry){
      result.push(Game.creeps[entry])
    })
  },

  workRate: function(creeps: Creep[], perWorkPart: number){
    var workRate = 0

    _.forEach(creeps, function(creep){
      _.forEach(creep.body, function(part){
        if(part.type == WORK){
          workRate += perWorkPart
        }
      })
    })

    return workRate
  },

  spawn(kernel: Kernel, roomName: string, creepType: string, name: string, memory: any): boolean{
    let body = CreepBuilder.design(creepType, Game.rooms[roomName])
    let spawns = kernel.data.roomData[roomName].spawns
    let outcome = false

    _.forEach(spawns, function(spawn){
      if(!_.includes(kernel.data.usedSpawns, spawn.id) &&!spawn.spawning && spawn.canCreateCreep(body) === OK){
        spawn.createCreep(body, name, memory)
        outcome = true
        kernel.data.usedSpawns.push(spawn.id)
      }
    })

    return outcome
  },

  withdrawTarget(creep: Creep, proc: Process){
    let withdraws = [].concat(
      <never[]>proc.kernel.data.roomData[creep.room.name].generalContainers
    )

    if(withdraws.length === 0){
      withdraws = <never[]>proc.kernel.data.roomData[creep.room.name].spawns
      withdraws = <never[]>_.filter(withdraws, function(spawn: StructureSpawn){
        return (spawn.energy > 250 && spawn.room.energyAvailable > (spawn.room.energyCapacityAvailable - 50))
      })
    }

    return <Structure>creep.pos.findClosestByRange(withdraws)
  }

  /*roomDeliveryTarget(kernel: Kernel, roomName: string){
    return Utils.roomDeliveryTargets(kernel, roomName)[0]
  },

  roomDeliveryTargets(kernel: Kernel, roomName: string): Structure[]{

  }*/
}
