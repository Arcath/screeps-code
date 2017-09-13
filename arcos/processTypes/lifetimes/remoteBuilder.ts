import {LifetimeProcess} from '../../os/process'

import {BuildProcess} from '../creepActions/build'
import {HarvestProcess} from '../creepActions/harvest'

export class RemoteBuilderLifetimeProcess extends LifetimeProcess{
  type = 'rblf'

  run(){
    let creep = this.getCreep()
    let site = <ConstructionSite>Game.getObjectById(this.metaData.site)

    if(!creep){ return }
    if(!site){
      this.completed = true
      return
    }

    if(_.sum(creep.carry) === 0){
      let source = site.pos.findClosestByRange(this.kernel.data.roomData[site.pos.roomName].sources)

      this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
        creep: creep.name,
        source: source.id
      })

      return
    }

    this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
      creep: creep.name,
      site: site.id
    })
  }
}
