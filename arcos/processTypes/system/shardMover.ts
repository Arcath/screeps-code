import {Process} from '../../os/process'

export class ShardMoverProcess extends Process{
  type = AOS_SHARD_MOVER_PROCESS
  metaData: MetaData[AOS_SHARD_MOVER_PROCESS]

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep){
      this.completed = true
      return
    }

    this.fork(AOS_MOVE_PROCESS, 'move-' + creep.name, this.priority - 1, {
      creep: creep.name,
      pos: this.metaData.destination,
      range: 0
    })
  }
}