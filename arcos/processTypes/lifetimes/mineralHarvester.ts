import {LifetimeProcess} from '../../os/process'

export class MineralharvesterLifetimeProcess extends LifetimeProcess{
  type = AOS_MINERAL_HARVESTER_LIFETIME_PROCESS
  metaData: MetaData[AOS_MINERAL_HARVESTER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      this.fork(AOS_MINERAL_HARVEST_PROCESS, 'mineral-harvest-' + creep.name, this.priority - 1, {
        mineral: this.metaData.mineral,
        extractor: this.metaData.extractor,
        creep: creep.name
      })

      return
    }

    let mineral = <Mineral>Game.getObjectById(this.metaData.mineral)

    this.fork(AOS_DELIVER_PROCESS, 'deliver-' + creep.name, this.priority - 1, {
      creep: creep.name,
      resource: mineral!.mineralType,
      target: creep.room.storage!.id
    })
  }
}
