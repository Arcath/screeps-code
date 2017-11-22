import {Process} from '../../os/process'

export class DeliverProcess extends Process{
  metaData: MetaData[AOS_DELIVER_PROCESS]
  type = AOS_DELIVER_PROCESS

  run(){
    let creep = Game.creeps[this.metaData.creep]
    let target = <Structure>Game.getObjectById(this.metaData.target)


    if(!target || !creep || _.sum(creep.carry) === 0){
      this.completed = true
      this.resumeParent()
      return
    }

    if(!creep.pos.inRangeTo(target, 1)){
      this.fork(AOS_MOVE_PROCESS, creep.name + '-deliver-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: target.pos.x,
          y: target.pos.y,
          roomName: target.pos.roomName
        },
        range: 1
      })
    }else{
      if(creep.transfer(target, (this.metaData.resource || RESOURCE_ENERGY)) == ERR_FULL){
        this.completed = true
        this.resumeParent()
      }
    }
  }
}
