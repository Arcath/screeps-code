import {LifetimeProcess} from '../../os/process'

import {MineralHarvestProcess} from '../creepActions/mineralHarvest'
import {DeliverProcess} from '../creepActions/deliver'

export class MineralharvesterLifetimeProcess extends LifetimeProcess{
  type = 'mhlf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      this.fork(MineralHarvestProcess, 'mineral-harvest-' + creep.name, this.priority - 1, {
        mineral: this.metaData.mineral,
        extractor: this.metaData.extractor,
        creep: creep.name
      })

      return
    }

    let mineral = <Mineral>Game.getObjectById(this.metaData.mineral)

    this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
      creep: creep.name,
      resource: mineral!.mineralType,
      target: creep.room.storage!.id
    })
  }
}
