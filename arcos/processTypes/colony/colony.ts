import {Process} from '../../os/process'
import {Colony} from 'classes/colony'

export class ColonyProcess extends Process{
  type = AOS_COLONY_PROCESS
  metaData: MetaData[AOS_COLONY_PROCESS]

  colony: Colony

  run(){
    // Check that the primary room is still alive
    if(!this.room()){
      // Primary room is dead, end this process
      this.completed = true
      return
    }

    // Confirm that the colony exists in memory
    let colony = this.kernel.memory.empire.getColony(this.metaData.roomName)

    if(colony){
      this.colony = colony
    }else{
      this.completed = true
      return
    }

    if(Object.keys(this.colony.sources).length === 0){
      // There are no sources in the colony (must be new)
      this.colony.findSources()
    }

    this.kernel.addProcessIfNotExist(AOS_SPAWN_QUEUE_PROCESS, 'sq-' + colony.coreRoom.name, 85, {
      colonyProcessName: this.name
    })

    Object.keys(this.colony.sources).forEach((sourceId) => {
      this.kernel.addProcessIfNotExist(AOS_SOURCE_PROCESS, 'source-' + sourceId, this.priority - 2, {
        colonyProcessName: this.name,
        source: sourceId
      })
    })

    if(this.colony.totalIncome() < this.colony.requiredIncome()){
      this.log('need ' + (this.colony.requiredIncome() - this.colony.totalIncome()) + ' more energy income')
    }
  }
}