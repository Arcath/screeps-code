import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class ClaimProcess extends Process{
  metaData: MetaData[AOS_CLAIM_PROCESS]
  type = AOS_CLAIM_PROCESS

  run(){
    let creep = Game.creeps[this.metaData.creep!]

    let flag = Game.flags[this.metaData.flagName]

    if(!creep && Object.keys(Game.creeps).length === 1){
      creep = Game.creeps[Object.keys(Game.creeps)[0]]
      this.metaData.creep = Object.keys(Game.creeps)[0]
    }


    if(!flag){
      this.completed = true

      return
    }

    if(!creep){
      let creepName = 'claim-' + this.metaData.targetRoom + '-' + Game.time
      if(!this.metaData.spawnRoom){
        this.metaData.spawnRoom = Utils.nearestRoom(this.metaData.targetRoom, 650)
      }
      let spawned = Utils.spawn(
        this.kernel,
        this.metaData.spawnRoom,
        'claimer',
        creepName,
        {}
      )

      if(spawned){
        this.metaData.creep = creepName
      }

      return
    }

    let room = Game.rooms[this.metaData.targetRoom]

    if(!room){
      this.fork(AOS_MOVE_PROCESS, 'move-' + creep.name, this.priority - 1, {
        creep: creep.name,
        pos: flag.pos,
        range: 1
      })
    }else{
      creep.claimController(creep.room.controller!)
      this.completed = true
      flag.remove()
    }
  }
}
