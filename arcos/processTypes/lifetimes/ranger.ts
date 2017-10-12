import {LifetimeProcess} from '../../os/process'

import {MoveProcess} from '../creepActions/move'

export class RangerLifetimeProcess extends LifetimeProcess{
  type = 'rangerLifetime'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    let flag = Game.flags[this.metaData.flag]

    if(!flag){
      this.completed = true

      return
    }

    if(creep.room.name != flag.pos.roomName){
      this.fork(MoveProcess, 'move-' + creep.name, this.priority - 1, {
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

    let hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 20)

    if(hostiles.length > 0){
      let nearestHostile = <Creep>creep.pos.findClosestByRange(hostiles)

      if(creep.rangedAttack(nearestHostile) === ERR_NOT_IN_RANGE){
        creep.moveTo(nearestHostile)
      }
    }else{
      if(!creep.pos.inRangeTo(flag.pos, 2)){
        creep.moveTo(flag)
      }
    }
  }
}
