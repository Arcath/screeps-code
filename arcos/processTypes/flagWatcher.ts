import {Process} from '../os/process'
import {Utils} from '../lib/utils'

export class FlagWatcherProcess extends Process{
  type = AOS_FLAG_WATCHER_PROCESS
  metaData: MetaData[AOS_FLAG_WATCHER_PROCESS]

  claimFlag(flag: Flag){
    let spawnRoom = flag.name.split('.')[1]

    this.kernel.addProcessIfNotExist(
      AOS_CLAIM_PROCESS,
      'claim-' + flag.name,
      20,
      {
        targetRoom: flag.pos.roomName,
        flagName: flag.name,
        spawnRoom: spawnRoom
      }
    )
  }

  holdFlag(flag: Flag){
    this.kernel.addProcessIfNotExist(
      AOS_HOLD_ROOM_PROCESS,
      'hold-' + flag.name,
      20,
      {
        flag: flag.name
      }
    )
  }

  newShard(flag: Flag){
    if(Object.keys(Game.creeps).length === 1){
      this.kernel.addProcessIfNotExist(
        AOS_CLAIM_PROCESS,
        'claim-' + flag.name,
        20,
        {
          targetRoom: flag.pos.roomName,
          flagName: flag.name,
          creep: Object.keys(Game.creeps)[0]
        }
      )
    }
  }

  remoteMiningFlag(flag: Flag){
    this.kernel.addProcessIfNotExist(
      AOS_REMOTE_MINING_MANAGEMENT_PROCESS,
      'rmmp-' + flag.name,
      40,
      {
        flag: flag.name
      }
    )
  }

  rangerFlag(flag: Flag){
    let count = parseInt(flag.name.split('.')[1])
    this.kernel.addProcessIfNotExist(AOS_RANGER_MANAGEMENT_PROCESS, flag.name + '-rangers', 70, {
      flag: flag.name,
      rangers: [],
      count: count
    })
  }

  setLinkerPos(flag: Flag){
    let roomName = flag.pos.roomName
    if(!Memory.bunkers[roomName]){
      Memory.bunkers[roomName] = {
        bunker: {
          creeps: {
            linker: {
              x: flag.pos.x,
              y: flag.pos.y
            }
          }
        }
      }
    }

    if(!Memory.bunkers[roomName].bunker){
      Memory.bunkers[roomName].bunker = {
        creeps: {
          linker: {
            x: flag.pos.x,
            y: flag.pos.y
          }
        }
      }
    }

    flag.remove()
  }

  shardMove(flag: Flag){
    let creepType = 'no'
    switch(flag.secondaryColor){
      case COLOR_RED:
        creepType = 'claimer'
      break
      case COLOR_YELLOW:
        creepType = 'worker'
      break
    }

    if(creepType !== 'no'){
      let creepName = 'is-' + Game.time

      let spawnRoom = Utils.nearestRoom(flag.pos.roomName, 650)
      this.log(spawnRoom)

      let spawned = Utils.spawn(
        this.kernel,
        spawnRoom,
        creepType,
        creepName,
        {}
      )

      if(spawned){
        this.kernel.addProcess(AOS_SHARD_MOVER_PROCESS, 'sm-' + creepName, 70, {
          creep: creepName,
          destination: {
            roomName: flag.pos.roomName,
            x: flag.pos.x,
            y: flag.pos.y
          }
        })

        flag.remove()
      }
    }
  }

  buildIt(flag: Flag){
    if(Object.keys(Game.creeps).length === 1){
      this.kernel.addProcessIfNotExist(
        AOS_REMOTE_BUILDER_LIFETIME_PROCESS,
        'rblf-' + flag.name,
        20,
        {
          creep: Object.keys(Game.creeps)[0],
          site: flag.name
        }
      )
    }
  }

  run(){
    this.completed = true

    let proc = this

    _.forEach(Game.flags, function(flag){
      switch(flag.color){
        case COLOR_PURPLE:
          switch(flag.secondaryColor){
            case COLOR_PURPLE:
              proc.holdFlag(flag)
            break
            case COLOR_RED:
              proc.claimFlag(flag)
            break
            case COLOR_WHITE:
              proc.newShard(flag)
            break
          }
        break
        case COLOR_YELLOW:
          proc.remoteMiningFlag(flag)
        break
        case COLOR_BLUE:
          proc.rangerFlag(flag)
        break
        case COLOR_WHITE:
          switch(flag.secondaryColor){
            case COLOR_BLUE:
              proc.setLinkerPos(flag)
            break
          }
        break
        case COLOR_GREEN:
          proc.shardMove(flag)
        break
        case COLOR_BROWN:
          proc.buildIt(flag)
        break
      }
    })
  }
}
