import {MoveProcess} from './move'
import {Process} from '../../os/process'

interface BuildProcessMetaData{
  creep: string
  site: string
}

export class BuildProcess extends Process{
  metaData: BuildProcessMetaData
  type = 'build'

  run(){
    let creep = Game.creeps[this.metaData.creep]
    let site = <ConstructionSite>Game.getObjectById(this.metaData.site)

    if(creep && !site){
      Memory.rooms[creep.room.name] = {}
    }

    if(!site || !creep || _.sum(creep.carry) === 0){
      this.completed = true
      this.resumeParent(true)
      return
    }

    if(!creep.pos.inRangeTo(site, 3)){
      this.kernel.addProcess(MoveProcess, creep.name + '-build-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: site.pos.x,
          y: site.pos.y,
          roomName: site.pos.roomName
        },
        range: 3
      })
      this.suspend = creep.name + '-build-move'
    }else{
      creep.build(site)
    }
  }
}
