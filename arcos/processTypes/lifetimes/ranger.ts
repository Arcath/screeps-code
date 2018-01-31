import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'

export class RangerLifetimeProcess extends LifetimeProcess{
  type = AOS_RANGER_LIFETIME_PROCESS
  metaData: MetaData[AOS_RANGER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    let flag = Game.flags[this.metaData.flag]

    if(!flag){
      this.completed = true

      return
    }

    let hostiles = Utils.filterHostileCreeps(creep.room.find(FIND_HOSTILE_CREEPS))

    /*if(!this.metaData.rangedBoosted && creep.room.controller && creep.room.controller.my && hostiles.length > 0){
      if(this.kernel.hasProcess('labs-' + creep.room.name)){
        let proc = this.kernel.getProcess(AOS_LAB_MANAGEMENT_PROCESS, 'labs-' + creep.room.name)

        if(proc && proc.metaData.boosts[RESOURCE_CATALYZED_KEANIUM_ALKALIDE]){
          this.fork(AOS_BOOST_PROCESS, 'boost-' + creep.name, this.priority - 1, {
            creep: creep.name,
            lab: proc.metaData.boosts[RESOURCE_CATALYZED_KEANIUM_ALKALIDE]
          })

          this.metaData.rangedBoosted = true
        }
      }
    }*/

    if(creep.room.name != flag.pos.roomName && hostiles.length === 0){
      this.fork(AOS_MOVE_PROCESS, 'move-' + creep.name, this.priority - 1, {
        creep: creep.name,
        pos: {
          x: flag.pos.x,
          y: flag.pos.y,
          roomName: flag.pos.roomName
        },
        range: 1
      })

      return
    }

    if(creep.hits < creep.hitsMax){
      creep.heal(creep)
    }

    let hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES)
    if(hostileStructures.length > 0 && creep.room.name === flag.pos.roomName){
      let creepPos = creep.pos
      let spawns = _.filter(hostileStructures, (structure) => {
        return (
          structure.structureType === STRUCTURE_SPAWN
          &&
          !PathFinder.search(creepPos, {
            pos: structure.pos,
            range: 1
          }).incomplete
        )
      })

      if(spawns.length > 0){
        let spawn = creep.pos.findClosestByRange(spawns)
        if(creep.pos.findInRange(hostiles, 3).length > 1){
          creep.rangedMassAttack()
        }else{
          if(!creep.pos.inRangeTo(spawn.pos, 1)){
            creep.moveTo(spawn)
          }else{
            creep.rangedAttack(spawn)
          }
        }

        return
      }

      let towers = _.filter(hostileStructures, (structure) => {
        return (
          structure.structureType === STRUCTURE_TOWER
          &&
          structure.energy > 0
        )
      })

      if(towers.length > 0){
        let tower = creep.pos.findClosestByRange(towers)

        if(creep.pos.findInRange(hostiles, 3).length > 1){
          creep.rangedMassAttack()
        }else{
          if(!creep.pos.inRangeTo(tower.pos, 1)){
            creep.moveTo(tower)
          }else{
            creep.rangedAttack(tower)
          }
        }

        return
      }

      if(hostiles.length === 0){
        let structure = creep.pos.findClosestByRange(hostileStructures)
        if(!creep.pos.inRangeTo(structure.pos, 1)){
          creep.moveTo(structure)
        }else{
          creep.rangedAttack(structure)
        }
      }
    }


    if(hostiles.length > 0){
      let nearestHostile = <Creep>creep.pos.findClosestByRange(hostiles)

      if(creep.pos.findInRange(hostiles, 3).length > 1){
        creep.rangedMassAttack()
      }else{
        if(creep.rangedAttack(nearestHostile) === ERR_NOT_IN_RANGE){
          creep.moveTo(nearestHostile)
        }
      }
    }else{
      if(!creep.pos.inRangeTo(flag.pos, 2)){
        creep.moveTo(flag)
      }
    }
  }
}
