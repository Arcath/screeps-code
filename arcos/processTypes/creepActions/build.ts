import {Process} from '../../os/process'

export class BuildProcess extends Process{
  metaData: MetaData[AOS_BUILD_PROCESS]
  type = AOS_BUILD_PROCESS

  run(){
    let creep = Game.creeps[this.metaData.creep]
    let site = <ConstructionSite>Game.getObjectById(this.metaData.site)

    if(!site || !creep || _.sum(creep.carry) === 0){
      this.completed = true
      this.resumeParent()
      return
    }

    if(!creep.pos.inRangeTo(site, 3)){
      this.fork(AOS_MOVE_PROCESS, creep.name + '-build-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: site.pos.x,
          y: site.pos.y,
          roomName: site.pos.roomName
        },
        range: 3
      })
    }else{
      creep.build(site)
    }
  }
}
