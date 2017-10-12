import {Utils} from '../../lib/utils'
import {Process} from '../../os/process'

import {BuilderLifetimeProcess} from '../lifetimes/builder'
import {RepairerLifetimeProcess} from '../lifetimes/repairer'

interface StructureManagementProcessMetaData{
  roomName: string
  spareCreeps: string[]
  buildCreeps: string[]
  repairCreeps: string[]
}

export class StructureManagementProcess extends Process{
  metaData: StructureManagementProcessMetaData
  type = 'sm'

  ensureMetaData(){
    if(!this.metaData.spareCreeps)
      this.metaData.spareCreeps = []

    if(!this.metaData.buildCreeps)
      this.metaData.buildCreeps = []

    if(!this.metaData.repairCreeps)
      this.metaData.repairCreeps = []
  }

  run(){
    this.ensureMetaData()

    if(!this.kernel.data.roomData[this.metaData.roomName]){
      this.completed = true
      return
    }

    let numBuilders = _.min([
      Math.ceil(this.kernel.data.roomData[this.metaData.roomName].constructionSites.length / 10),
      3,
      this.kernel.data.roomData[this.metaData.roomName].constructionSites.length,
      this.room().controller!.level - 1
    ])

    this.metaData.buildCreeps = Utils.clearDeadCreeps(this.metaData.buildCreeps)
    this.metaData.repairCreeps = Utils.clearDeadCreeps(this.metaData.repairCreeps)
    this.metaData.spareCreeps = Utils.clearDeadCreeps(this.metaData.spareCreeps)

    if(this.metaData.buildCreeps.length < numBuilders){
      if(this.metaData.spareCreeps.length === 0){
        let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
        let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
        if(spawned){
          this.metaData.buildCreeps.push(creepName)
          this.kernel.addProcess(BuilderLifetimeProcess, 'blf-' + creepName, 30, {
            creep: creepName
          })
        }
      }else{
        let creepName = <string>this.metaData.spareCreeps.pop()
        this.metaData.buildCreeps.push(creepName)
        this.kernel.addProcess(BuilderLifetimeProcess, 'blf-' + creepName, 30, {
          creep: creepName
        })
      }
    }

    let repairableObjects = <Structure[]>[].concat(
      <never[]>this.kernel.data.roomData[this.metaData.roomName].containers,
      <never[]>this.kernel.data.roomData[this.metaData.roomName].roads
    )

    let repairTargets = _.filter(repairableObjects, function(object){
      return (object.hits < object.hitsMax)
    })

    if(repairTargets.length > 0){
      if(this.metaData.repairCreeps.length == 0){
        if(this.metaData.spareCreeps.length === 0){
          let creepName = 'sm-' + this.metaData.roomName + '-' + Game.time
          let spawned = Utils.spawn(this.kernel, this.metaData.roomName, 'worker', creepName, {})
          if(spawned){
            this.metaData.repairCreeps.push(creepName)
            this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
              creep: creepName,
              roomName: this.metaData.roomName
            })
          }
        }else{
          let creepName = <string>this.metaData.spareCreeps.pop()
          this.metaData.repairCreeps.push(creepName)
          this.kernel.addProcess(RepairerLifetimeProcess, 'rlf-' + creepName, 29, {
            creep: creepName,
            roomName: this.metaData.roomName
          })
        }
      }
    }
  }
}
