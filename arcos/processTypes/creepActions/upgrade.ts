import {Process} from '../../os/process'

export class UpgradeProcess extends Process{
  metaData: MetaData[AOS_UPGRADE_PROCESS]
  type = AOS_UPGRADE_PROCESS

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep || _.sum(creep.carry) === 0){
      this.completed = true
      this.resumeParent()
      return
    }

    if(!creep.pos.inRangeTo(creep.room.controller!, 3)){
      this.fork(AOS_MOVE_PROCESS, creep.name + '-upgrade-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: creep.room.controller!.pos.x,
          y: creep.room.controller!.pos.y,
          roomName: creep.room.name
        },
        range: 3
      })
    }else{
      creep.upgradeController(creep.room.controller!)
    }
  }
}
