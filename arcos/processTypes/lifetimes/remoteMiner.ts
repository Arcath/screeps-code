import {LifetimeProcess} from '../../os/process'

export class RemoteMinerLifetimeProcess extends LifetimeProcess{
  type = AOS_REMOTE_MINER_LIFETIME_PROCESS
  metaData: MetaData[AOS_REMOTE_MINER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    let flag = Game.flags[this.metaData.flag]

    if(!flag){
      this.completed = true
      return
    }

    if(creep.room.name === flag.pos.roomName){
      if(creep.room.find(FIND_HOSTILE_CREEPS).length > 0){
        if(!Memory.remoteRoomStatus){
          Memory.remoteRoomStatus = {}
        }

        Memory.remoteRoomStatus[creep.room.name] = false
      }else{
        if(!Memory.remoteRoomStatus){
          Memory.remoteRoomStatus = {}
        }

        Memory.remoteRoomStatus[creep.room.name] = true
      }
    }

    if(_.sum(creep.carry) === 0){
      if(!creep.pos.isNearTo(flag)){
        this.fork(AOS_MOVE_PROCESS, 'move-' + creep.name, this.priority - 1, {
          creep: creep.name,
          pos: {
            x: flag.pos.x,
            y: flag.pos.y,
            roomName: flag.pos.roomName
          },
          range: 1
        })
      }

      this.fork(AOS_HARVEST_PROCESS, 'harvest-' + creep.name, this.priority - 1, {
        creep: creep.name,
        source: flag.memory.source
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

    if(Game.rooms[this.metaData.deliverRoom].storage){
      this.fork(AOS_DELIVER_PROCESS, 'deliver-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: Game.rooms[this.metaData.deliverRoom].storage!.id,
        resource: RESOURCE_ENERGY
      })
    }
  }
}
