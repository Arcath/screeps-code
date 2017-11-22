import {Process} from '../../os/process'

export class BoostProcess extends Process{
  type = AOS_BOOST_PROCESS
  metaData: MetaData[AOS_BOOST_PROCESS]

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep){
      this.completed = true
      return
    }

    let lab = <StructureLab>Game.getObjectById(this.metaData.lab)
    if(!creep.pos.inRangeTo(lab, 1)){
      this.fork(AOS_MOVE_PROCESS, creep.name + '-collect-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: lab.pos.x,
          y: lab.pos.y,
          roomName: lab.pos.roomName
        },
        range: 1
      })
    }else{
      lab.boostCreep(creep)
      this.completed = true
    }
  }
}
