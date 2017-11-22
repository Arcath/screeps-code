import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class RepairProcess extends Process{
  metaData: MetaData[AOS_REPAIR_PROCESS]
  type = AOS_REPAIR_PROCESS

  run(){
    let creep = Game.creeps[this.metaData.creep]
    let target = <Structure>Game.getObjectById(this.metaData.target)

    if(!target || !creep || _.sum(creep.carry) === 0){
      this.completed = true
      this.resumeParent()
      return
    }

    if(!creep.pos.inRangeTo(target, 3)){
      this.fork(AOS_MOVE_PROCESS, creep.name + '-repair-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: target.pos.x,
          y: target.pos.y,
          roomName: target.pos.roomName
        },
        range: 3
      })
    }else{
      if(
        target.hits === target.hitsMax
        ||
        (target.structureType === STRUCTURE_RAMPART && target.hits > Utils.rampartHealth(this.kernel, creep.room.name))
      ){
        this.completed = true
        this.resumeParent()
        return
      }

      creep.repair(target)
    }
  }
}
