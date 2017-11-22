import {Process} from '../../os/process'

export class CollectProcess extends Process{
  metaData: MetaData[AOS_COLLECT_PROCESS]
  type = AOS_COLLECT_PROCESS

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep){
      this.completed = true
      this.resumeParent()
      return
    }

    let target = <Structure>Game.getObjectById(this.metaData.target)

    if(!target){
      this.completed = true
      this.resumeParent(true)
      return
    }

    if(!creep.pos.isNearTo(target)){
      this.fork(AOS_MOVE_PROCESS, creep.name + '-collect-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: target.pos.x,
          y: target.pos.y,
          roomName: target.pos.roomName
        },
        range: 1
      })
    }else{
      creep.withdraw(target, this.metaData.resource)
      this.completed = true
      this.resumeParent()
    }
  }
}
