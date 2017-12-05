import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class RemoteMiningManagementProcess extends Process{
  type = AOS_REMOTE_MINING_MANAGEMENT_PROCESS
  metaData: MetaData[AOS_REMOTE_MINING_MANAGEMENT_PROCESS]

  run(){
    let flag = Game.flags[this.metaData.flag]

    if(!flag){
      this.completed = true
      return
    }

    if(!flag.memory.source){
      let sources = <Source[]>flag.pos.lookFor(LOOK_SOURCES)
      flag.memory.source = sources[0].id
    }

    let miningCreep = Game.creeps[this.metaData.miningCreep!]
    let deliverRoom = flag.name.split('-')[0]

    if(!Game.rooms[deliverRoom]){
      this.completed = true
      return
    }

    if(!miningCreep){
      let spawned = Utils.spawn(
        this.kernel,
        deliverRoom,
        'worker',
        'rm-' + flag.pos.roomName + '-' + Game.time,
        {}
      )

      if(spawned){
        this.metaData.miningCreep = 'rm-' + flag.pos.roomName + '-' + Game.time
      }
    }else{
      this.kernel.addProcessIfNotExist(AOS_REMOTE_MINER_LIFETIME_PROCESS, 'rmlf-' + miningCreep.name, this.priority, {
        creep: miningCreep.name,
        flag: flag.name,
        deliverRoom: deliverRoom
      })
    }

    let container = <StructureContainer>_.filter(flag.pos.findInRange(FIND_STRUCTURES, 1), function(structure: Structure){
      return structure.structureType === STRUCTURE_CONTAINER
    })[0]

    if(container){
      let transportCreep = Game.creeps[this.metaData.transportCreep!]
      if(!transportCreep){
        let spawned = Utils.spawn(
          this.kernel,
          deliverRoom,
          'transporter',
          't-' + flag.pos.roomName + '-' + Game.time,
          {}
        )

        if(spawned){
          this.metaData.transportCreep = 't-' + flag.pos.roomName + '-' + Game.time

          this.kernel.addProcessIfNotExist(AOS_TRANSPORTER_LIFETIME_PROCESS, 'tlf-' + flag.pos.roomName + '-' + Game.time, this.priority, {
            creep: 't-' + flag.pos.roomName + '-' + Game.time,
            sourceContainer: container.id,
            destinationContainer: Game.rooms[deliverRoom].storage!.id
          })
        }
      }
    }
  }
}
