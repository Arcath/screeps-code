import {Process} from '../../os/process'

export class HarvestProcess extends Process{
  metaData: MetaData[AOS_HARVEST_PROCESS]
  type = AOS_HARVEST_PROCESS

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep || _.sum(creep.carry) === creep.carryCapacity){
      this.completed = true
      this.resumeParent()
      return
    }

    let targetPos: RoomPosition
    let targetRange: number

    // Load the source pos from the POS cache
    let sourcePos = this.kernel.memory.posCache.get(this.metaData.source)

    if(!sourcePos){
      // we don't know the POS of the source we can't move on from here.
      // Hopefully something will scout it shortly
      return
    }

    // Get the colony for this source
    let colony = this.kernel.memory.empire.getColony(sourcePos.roomName)

    if(colony){
      // If the colony exists
      let sourceContainer = colony.sourceContainer(this.metaData.source)
      if(sourceContainer === false){
        // If there is no source container
        targetPos = sourcePos
        targetRange = 1
      }else if(typeof sourceContainer === 'string'){
        // It exists but we can't see it.
        let containerPos = this.kernel.memory.posCache.get(sourceContainer)
        if(containerPos){
          // We had the pos cached.
          targetPos = containerPos
          targetRange = 0
        }else{
          // No Cache
          targetPos = sourcePos
          targetRange = 1
        }
      }else{
        // We have vision on the source container
        // Record it to the pos cache.
        this.kernel.memory.posCache.set(sourceContainer)
        targetPos = sourceContainer.pos
        targetRange = 0
      }
    }else{
      // No colony
      targetPos = sourcePos
      targetRange = 1
    }

    if(!creep.pos.inRangeTo(targetPos, targetRange)){
      this.fork(AOS_MOVE_PROCESS, creep.name + '-harvest-move', this.priority + 1, {
        creep: creep.name,
        pos: {
          x: targetPos.x,
          y: targetPos.y,
          roomName: targetPos.roomName
        },
        range: targetRange
      })
    }else{
      // We must be right next to the source at this point
      let source = Game.getObjectById<Source>(this.metaData.source)

      if(creep.harvest(source!) === ERR_NOT_ENOUGH_RESOURCES){
        this.suspend = source!.ticksToRegeneration
      }
    }
  }
}
