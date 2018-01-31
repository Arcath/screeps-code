import {ColonySubProcess} from '../../os/process'
import {Utils} from '../../lib/utils'
import {Colony} from '../../classes/colony'

export class SourceProcess extends ColonySubProcess{
  type = AOS_SOURCE_PROCESS
  metaData: MetaData[AOS_SOURCE_PROCESS]

  run(){
    // The colony process has completed, this process can end.
    if(this.colonyProcess().completed){
      this.completed = true
      return
    }

    if(!this.metaData.creeps){
      this.metaData.creeps = []
    }

    let colony = this.colonyProcess().colony
    let source = colony.source(this.metaData.source)

    this.metaData.creeps = Utils.clearDeadCreeps(this.metaData.creeps)

    if(source){
      this.checkOrCreateContainer()
      this.runLink()

      if(source.pos.roomName === colony.coreRoom.name){
        if(this.workRate() < (source.energyCapacity / 300)){
          // We need another creep
          this.spawnCreep('harvester', AOS_HARVESTER_LIFETIME_PROCESS, colony, {
            creep: '',
            source: this.metaData.source
          })
        }
      }else{
        // This must be a remote source
        if(this.metaData.creeps.length === 0){
          // The remote mining creep is dead
          this.spawnCreep('remoteHarvester', AOS_REMOTE_MINER_LIFETIME_PROCESS, colony, {
            creep: '',
            source: this.metaData.source
          })
        }

        this.kernel.addProcessIfNotExist(AOS_REMOTE_MINER_LIFETIME_PROCESS, 'lifetime-' + this.metaData.creeps[0], 80, {
          creep: this.metaData.creeps[0],
          source: this.metaData.source
        })
      }
    }else{
      // The colony doesn't have the source. Either no vision OR its not in use.
      return
    }
  }

  spawnCreep<T extends ProcessTypes>(bodyType: string, processType: T, colony: Colony, metaData: MetaData[T]){
    this.log('want to spawn ' + bodyType)
    if(colony.checkQueue(this.name) === false){
      // There is no entry in the spawn queue.
      let name = this.name + '-' + Game.time
      colony.addToSpawnQueue(this.name, bodyType, name, 90)
      this.metaData.nextName = name
    }else{
      // It is either waiting or spawning
      if(colony.checkQueue(this.name) === STATE_SPAWNING){
        // It is spawning, add it to the creep list.
        if(!_.includes(this.metaData.creeps!, this.metaData.nextName)){
          // We haven't added it to the list yet.
          this.metaData.creeps!.push(this.metaData.nextName!)
          this.kernel.addProcess(processType, 'lifetime-' + this.metaData.nextName, 80, metaData, this.name)
        }
      }
    }
  }

  /** Calculates the work rate of this source. */
  workRate(){
    let workRate = 0

    _.forEach(this.metaData.creeps!, (creepName) => {
      let creep = Game.creeps[creepName]

      _.forEach(creep.body, function(part){
        if(part.type == WORK){
          workRate += 2
        }
      })
    })

    return workRate
  }
 
  /**
   * Find the container or creates it if not avilable.
   */
  checkOrCreateContainer(){
    let container = this.colonyProcess().colony.sourceContainer(this.metaData.source)
    let source = this.colonyProcess().colony.source(this.metaData.source)

    if(!container && source){
      // There is vision but there is no container.
      let area = source.room.lookForAtArea(
        LOOK_TERRAIN,
        source.pos.y - 1,
        source.pos.x - 1,
        source.pos.y + 1,
        source.pos.x + 1
      )

      let roomName = source.room.name
      let viablePoses: RoomPosition[] = []
      let xAxis = new Array(source.pos.x - 1, source.pos.x, source.pos.x + 1)

      new Array(source.pos.y - 1, source.pos.y, source.pos.y + 1).forEach((y) => {
        xAxis.forEach((x) => {
          if(
            area[y][x].length > 0
            &&
            (
              area[y][x][0].toString() === 'plain'
              ||
              area[y][x][0].toString() === 'swamp'
            )
          ){
            viablePoses.push(new RoomPosition(x, y, roomName))
          }
        })
      })

      let containerPos = viablePoses[0]
      
      if(source.pos.roomName === this.colonyProcess().colony.coreRoom.name){
        containerPos = this.colonyProcess().colony.bunker.basePos.findClosestByRange(viablePoses)        
      }

      if(containerPos){
        containerPos.createConstructionSite(STRUCTURE_CONTAINER)
      }else{
        this.log('could not find POS for container (' + source.pos.roomName + ')')
      }
    }
  }

  /** Run this sources link. */
  runLink(){
    let link = this.colonyProcess().colony.sourceLink(this.metaData.source)
    let coreLink = this.colonyProcess().colony.coreLink()

    if(link && link !== true && coreLink){
      if(link.energy === LINK_CAPACITY){
        this.emProcLink(link)
      }
    }
  }

  emProcLink(link: StructureLink){
    let emProc = this.kernel.getProcess(AOS_ENERGY_MANAGEMENT_PROCESS, 'em-' + this.colonyProcess().colony.coreRoom.name)
    if(emProc){
      let requests = _.filter(
        emProc.metaData.linkRequests!,
        function(request: {
          link: string
        }){
          return (request.link === link.id)
        }
      )
      if(requests.length === 0){
        emProc.metaData.linkRequests!.push({
          link: link.id,
          send: false,
          stage: 0
        })
      }
    }
  }
}
