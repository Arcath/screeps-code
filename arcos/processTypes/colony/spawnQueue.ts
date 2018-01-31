import {ColonySubProcess} from '../../os/process'
import {CreepBuilder} from '../../lib/creepBuilder'

export class SpawnQueueProcess extends ColonySubProcess{
  type = AOS_SPAWN_QUEUE_PROCESS
  metaData: MetaData[AOS_SPAWN_QUEUE_PROCESS]

  run(){
    if(!this.colonyProcess()){
      // The colony process is gone, complete and return.
      this.completed = true
      return
    }

    // Creeps from LAST tick will be spawned this tick.
    //
    // This allows the queue to build for a ful tick before being acted on.
    //
    // ONE creep will be spawned per tick so that other spawns remain open for urgent creeps this tick.
    let colony = this.colonyProcess().colony
    let nextSpawn = colony.nextInSpawnQueue()

    if(nextSpawn){
      // There is something to spawn
      let spawns = _.filter(colony.spawns(), (spawn) => {
        return spawn.spawning === null
      })

      if(spawns.length > 0){
        // There is a spawn to spawn it.
        let spawn = spawns[0]
        let body = CreepBuilder.build(nextSpawn.type, spawn.room.energyCapacityAvailable)

        this.log('spawning ' + nextSpawn.type)

        if(spawn.spawnCreep(body.body, nextSpawn.name, {}) === OK){
          spawn.memory.key = nextSpawn.key
          colony.removeFromSpawnQueue(nextSpawn.key)
        }
      }
    }else{
      this.log('nothing to spawn')
    }
  }
}