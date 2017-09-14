import {MoveProcess} from './move'
import {Process} from '../../os/process'

interface RepairProcessMetaData{
  creep: string
  target: string
}

export class RepairProcess extends Process{
  metaData: RepairProcessMetaData
  type = 'repair'

  run(){
    let creep = Game.creeps[this.metaData.creep]
    let target = <Structure>Game.getObjectById(this.metaData.target)

    if(!target || !creep || _.sum(creep.carry) === 0){
      this.completed = true
      this.resumeParent()
      return
    }

    if(!creep.pos.inRangeTo(target, 3)){
      this.kernel.addProcess(MoveProcess, creep.name + '-repair-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: target.pos.x,
          y: target.pos.y,
          roomName: target.pos.roomName
        },
        range: 3
      })
      this.suspend = creep.name + '-repair-move'
    }else{
      if(target.hits === target.hitsMax){
        this.completed = true
        this.resumeParent()
        return
      }

      creep.repair(target)
    }
  }
}
