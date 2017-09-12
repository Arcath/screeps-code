import {MoveProcess} from './move'
import {Process} from '../../os/process'

interface CollectProcessMetaData{
  creep: string
  target: string,
  resource: string
}

export class CollectProcess extends Process{
  metaData: CollectProcessMetaData
  type = 'collect'

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep){
      this.completed = true
      return
    }

    let target = <Structure>Game.getObjectById(this.metaData.target)

    if(!target){
      this.completed = true
      return
    }

    if(!creep.pos.isNearTo(target)){
      this.kernel.addProcess(MoveProcess, creep.name + '-collect-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: target.pos.x,
          y: target.pos.y,
          roomName: target.pos.roomName
        },
        range: 1
      })
      this.suspend = creep.name + '-collect-move'
    }else{
      creep.withdraw(target, this.metaData.resource)
      this.completed = true
    }
  }
}
