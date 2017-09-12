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

      this.kernel.addProcess(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
        creep: creep.name,
        source: source.id
      })

      this.suspend = 'harvest-' + creep.name
      return
    }

    this.kernel.addProcess(BuildProcess, 'build-' + creep.name, this.priority - 1, {
      creep: creep.name,
      site: site.id
    })
    this.suspend = 'build-' + creep.name
  }
}
