import {LifetimeProcess} from '../../os/process'

export class RemoteBuilderLifetimeProcess extends LifetimeProcess{
  type = AOS_REMOTE_BUILDER_LIFETIME_PROCESS
  metaData: MetaData[AOS_REMOTE_BUILDER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()
    let site = <ConstructionSite>Game.getObjectById(this.metaData.site)

    if(!creep){ return }
    if(!site){
      this.completed = true
      return
    }

    if(_.sum(creep.carry) === 0){
      if(creep.room.storage){
        this.fork(AOS_COLLECT_PROCESS, 'collect-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: creep.room.storage.id,
          resource: RESOURCE_ENERGY
        })

        return
      }else{
        let source = site.pos.findClosestByRange(this.kernel.data.roomData[site.pos.roomName].sources)

        this.fork(AOS_HARVEST_PROCESS, 'harvest-' + creep.name, this.priority - 1, {
          creep: creep.name,
          source: source.id
        })

        return
      }
    }

    if(
      creep.room.controller!.level < 2
      ||
      creep.room.controller!.ticksToDowngrade < 4000
      ||
      creep.room.controller!.ticksToDowngrade < (CONTROLLER_DOWNGRADE[creep.room.controller!.level] - 5000)
    ){
      this.fork(AOS_UPGRADE_PROCESS, 'upgrade-' + creep.name, this.priority - 1, {
        creep: creep.name
      })

      return
    }

    this.fork(AOS_BUILD_PROCESS, 'build-' + creep.name, this.priority - 1, {
      creep: creep.name,
      site: site.id
    })
  }
}
