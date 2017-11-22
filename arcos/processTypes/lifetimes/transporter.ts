import {LifetimeProcess} from '../../os/process'

export class TransporterLifetimeProcess extends LifetimeProcess{
  type = AOS_TRANSPORTER_LIFETIME_PROCESS
  metaData: MetaData[AOS_TRANSPORTER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      let container = <StructureContainer>Game.getObjectById(this.metaData.sourceContainer)

      if(container){
        this.fork(AOS_COLLECT_PROCESS, 'collect-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: container.id,
          resource: RESOURCE_ENERGY
        })
      }

      return
    }

    let container = <StructureContainer>Game.getObjectById(this.metaData.destinationContainer)

    if(container){
      this.fork(AOS_DELIVER_PROCESS, 'deliver-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: container.id,
        resource: RESOURCE_ENERGY
      })
    }
  }
}
