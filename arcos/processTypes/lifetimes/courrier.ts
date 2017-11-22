import {LifetimeProcess} from '../../os/process'

export class CourrierLifetimeProcess extends LifetimeProcess{
  type = AOS_COURRIER_LIFETIME_PROCESS
  metaData: MetaData[AOS_COURRIER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      this.fork(AOS_COLLECT_PROCESS, 'collect-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: this.room().storage!.id,
        resource: RESOURCE_ENERGY
      })

      return
    }

    let targets = _.filter(this.roomData().generalContainers, function(container){
      return (_.sum(container.store) < container.storeCapacity)
    })

    let target = creep.pos.findClosestByRange(targets)

    if(target){
      this.fork(AOS_DELIVER_PROCESS, 'deliver-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: target.id,
        resource: RESOURCE_ENERGY
      })
    }
  }
}
