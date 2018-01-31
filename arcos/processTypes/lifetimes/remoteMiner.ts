import {LifetimeProcess} from '../../os/process'

export class RemoteMinerLifetimeProcess extends LifetimeProcess{
  type = AOS_REMOTE_MINER_LIFETIME_PROCESS
  metaData: MetaData[AOS_REMOTE_MINER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){
      this.completed = true
      return
    }

    let sourcePos = this.kernel.memory.posCache.get(this.metaData.source)
    if(!sourcePos){
      // We don't know the source POS, it should be scouted soon.
      return
    }

    let colony = this.kernel.memory.empire.getColony(sourcePos.roomName)
    if(!colony){
      return
    } 

    if(_.sum(creep.carry) === 0){
      this.fork(AOS_HARVEST_PROCESS, 'harvest-' + creep.name, this.priority - 1, {
        creep: creep.name,
        source: this.metaData.source
      })

      return
    }

    let sites = <ConstructionSite[]>creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 2)
    if(sites.length > 0){
      this.fork(AOS_BUILD_PROCESS, 'build-' + creep.name, this.priority - 1, {
        creep: creep.name,
        site: sites[0].id
      })

      return
    }

    let container = <StructureContainer>creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: function(structure: Structure){
        return (structure.structureType === STRUCTURE_CONTAINER)
      }
    })[0]

    if(container){
      if(container.hits < container.hitsMax){
        creep.repair(container)

        return
      }else{
        creep.transfer(container, RESOURCE_ENERGY)
        return
      }
    }

    if(colony.coreRoom.storage){
      this.fork(AOS_DELIVER_PROCESS, 'deliver-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: colony.coreRoom.storage.id,
        resource: RESOURCE_ENERGY
      })
    }
  }
}
