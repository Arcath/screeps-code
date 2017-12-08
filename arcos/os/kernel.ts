import {Process} from './process'

import {BoostProcess} from '../processTypes/creepActions/boost'
import {BuildProcess} from '../processTypes/creepActions/build'
import {BuilderLifetimeProcess} from '../processTypes/lifetimes/builder'
import {ClaimProcess} from '../processTypes/empireActions/claim'
import {CollectProcess} from '../processTypes/creepActions/collect'
import {CourrierLifetimeProcess} from '../processTypes/lifetimes/courrier'
import {DeliverProcess} from '../processTypes/creepActions/deliver'
import {DistroLifetimeProcess} from '../processTypes/lifetimes/distro'
import {EnergyManagementProcess} from '../processTypes/management/energy'
import {FlagWatcherProcess} from '../processTypes/flagWatcher'
import {InitProcess} from '../processTypes/system/init'
import {InterShardProcess} from '../processTypes/system/intershard'
import {HarvestProcess} from '../processTypes/creepActions/harvest'
import {HarvesterLifetimeProcess} from '../processTypes/lifetimes/harvester'
import {HoldRoomProcess} from '../processTypes/empireActions/hold'
import {HoldProcess} from '../processTypes/creepActions/hold'
import {LabManagementProcess} from '../processTypes/management/labs'
import {LoanDataProcess} from '../processTypes/system/loanData'
import {MineralHarvestProcess} from '../processTypes/creepActions/mineralHarvest'
import {MineralharvesterLifetimeProcess} from '../processTypes/lifetimes/mineralHarvester'
import {MineralManagementProcess} from '../processTypes/management/mineral'
import {MoveProcess} from '../processTypes/creepActions/move'
import {RangerLifetimeProcess} from '../processTypes/lifetimes/ranger'
import {RangerManagementProcess} from '../processTypes/management/rangers'
import {RemoteBuilderLifetimeProcess} from '../processTypes/lifetimes/remoteBuilder'
import {RemoteMinerLifetimeProcess} from '../processTypes/lifetimes/remoteMiner'
import {RemoteMiningManagementProcess} from '../processTypes/management/remoteMining'
import {RepairProcess} from '../processTypes/creepActions/repair'
import {RepairerLifetimeProcess} from '../processTypes/lifetimes/repairer'
import {RoomDataProcess} from '../processTypes/roomData'
import {RoomLayoutProcess} from '../processTypes/management/roomLayout'
import {ShardMoverProcess} from '../processTypes/system/shardMover'
import {SourceMapProcess} from '../processTypes/system/sourceMap'
import {StructureManagementProcess} from '../processTypes/management/structure'
import {SpawnRemoteBuilderProcess} from '../processTypes/system/spawnRemoteBuilder'
import {SuspensionProcess} from '../processTypes/system/suspension'
import {TowerDefenseProcess} from '../processTypes/buildingProcesses/towerDefense'
import {TowerRepairProcess} from '../processTypes/buildingProcesses/towerRepair'
import {TransporterLifetimeProcess} from '../processTypes/lifetimes/transporter'
import {UpgradeProcess} from '../processTypes/creepActions/upgrade'
import {UpgraderLifetimeProcess} from '../processTypes/lifetimes/upgrader'

import {Stats} from '../lib/stats'

export const processTypes = <{[type: string]: any}>{
  'boost': BoostProcess,
  'build': BuildProcess,
  'blf': BuilderLifetimeProcess,
  'claim': ClaimProcess,
  'collect': CollectProcess,
  'courrierLifetime': CourrierLifetimeProcess,
  'deliver': DeliverProcess,
  'dlf': DistroLifetimeProcess,
  'em': EnergyManagementProcess,
  'flagWatcher': FlagWatcherProcess,
  'harvest': HarvestProcess,
  'hlf': HarvesterLifetimeProcess,
  'holdRoom': HoldRoomProcess,
  'hold': HoldProcess,
  'init': InitProcess,
  'interShard': InterShardProcess,
  'labManagement': LabManagementProcess,
  'loanData': LoanDataProcess,
  'mh': MineralHarvestProcess,
  'mhlf': MineralharvesterLifetimeProcess,
  'mineralManagement': MineralManagementProcess,
  'move': MoveProcess,
  'rangerLifetime': RangerLifetimeProcess,
  'rangerManagement': RangerManagementProcess,
  'rblf': RemoteBuilderLifetimeProcess,
  'rmlf': RemoteMinerLifetimeProcess,
  'rmmp': RemoteMiningManagementProcess,
  'repair': RepairProcess,
  'rlf': RepairerLifetimeProcess,
  'roomData': RoomDataProcess,
  'roomLayout': RoomLayoutProcess,
  'shardMover': ShardMoverProcess,
  'sourceMap': SourceMapProcess,
  'sm': StructureManagementProcess,
  'spawnRemoteBuilder': SpawnRemoteBuilderProcess,
  'suspend': SuspensionProcess,
  'td': TowerDefenseProcess,
  'towerRepair': TowerRepairProcess,
  'transporterLifetime': TransporterLifetimeProcess,
  'upgrade': UpgradeProcess,
  'ulf': UpgraderLifetimeProcess
}

interface KernelData{
  roomData: {
    [name: string]: RoomData
  }
  usedSpawns: string[]
  costMatrixes: {
    [roomName: string]: CostMatrix
  }
}

interface ProcessTable{
  [name: string]: Process
}

export class Kernel{
  /** The CPU Limit for this tick */
  limit: number
  /** The process table */
  processTable: ProcessTable = {}
  /** IPC Messages */
  ipc: IPCMessage[] = []

  processTypes = processTypes

  data = <KernelData>{
    roomData: {},
    usedSpawns: [],
    costMatrixes: {}
  }

  execOrder: {}[] = []
  suspendCount = 0

  /**  Creates a new kernel ensuring that memory exists and re-loads the process table from the last. */
  constructor(){
    if(!Memory.arcos)
      Memory.arcos = {}

    this.setCPULimit()

    this.loadProcessTable()

    this.addProcess(AOS_INIT_PROCESS, 'init', 99, {})
  }

  sigmoid(x: number){
    return 1.0 / (1.0 + Math.exp(-x))
  }

  sigmoidSkewed(x: number){
    return this.sigmoid((x * 12.0) - 6.0)
  }

  /** Sets the CPU limit for the tick */
  setCPULimit(){
    let bucketCeiling = 9500
    let bucketFloor = 2000
    let cpuMin = 0.6

    if(Game.cpu.limit === undefined){
      // We are in the simulator
      this.limit = 1000
      return
    }

    if(Game.cpu.bucket > bucketCeiling){
      this.limit = Game.cpu.tickLimit - 10
    }else if(Game.cpu.bucket < 1000){
      this.limit = Game.cpu.limit * 0.4
    }else if(Game.cpu.bucket < bucketFloor){
      this.limit = Game.cpu.limit * cpuMin
    }else{
      let bucketRange = bucketCeiling - bucketFloor
      let depthInRange = (Game.cpu.bucket - bucketFloor) / bucketRange
      let minAssignable = Game.cpu.limit * cpuMin
      let maxAssignable = Game.cpu.tickLimit - 15
      this.limit = Math.round(minAssignable + this.sigmoidSkewed(depthInRange) * (maxAssignable - minAssignable))
    }
  }

  /** Check if the current cpu usage is below the limit for this tick */
  underLimit(){
    return (Game.cpu.getUsed() < this.limit)
  }

  /** Is there any processes left to run */
  needsToRun(){
    return (!!this.getHighestProcess())
  }

  /** Load the process table from Memory */
  loadProcessTable(){
    let kernel = this
    _.forEach(Memory.arcos.processTable, function(entry){
      if(processTypes[entry.type]){
        kernel.processTable[entry.name] = new processTypes[entry.type](entry, kernel)
      }else{
        kernel.processTable[entry.name] = new Process(entry, kernel)
      }
    })
  }

  /** Tear down the OS ready for the end of the tick */
  teardown(){
    let list: SerializedProcess[] = []
    _.forEach(this.processTable, function(entry){
      if(!entry.completed)
        list.push(entry.serialize())
    })

    //if(this.data.usedSpawns.length != 0){
    //  console.log(this.execOrder.length)
    //}

    Stats.build(this)

    Memory.arcos.processTable = list
  }

  /** Returns the highest priority process in the process table */
  getHighestProcess(){
    let toRunProcesses = _.filter(this.processTable, function(entry){
      return (!entry.ticked && entry.suspend === false )
    })

    return _.sortBy(toRunProcesses, 'priority').reverse()[0]
  }

  /** Run the highest priority process in the process table */
  runProcess(){
    let process = this.getHighestProcess()
    let cpuUsed = Game.cpu.getUsed()
    let faulted = false

    try{
      process.run(this)
    }catch (e){
      if(process.type === AOS_SOURCE_MAP_PROCESS){
        console.log('<span style="color:#e74c3c">SOURCE MAP PROCESS FAILED</span> \n ' + e)
      }else{
        this.addProcess(AOS_SOURCE_MAP_PROCESS, process.name + '-error', 90, {
          error: e,
          processName: process.name
        })
      }
      faulted = true
    }

    this.execOrder.push({
      name: process.name,
      cpu: Game.cpu.getUsed() - cpuUsed,
      type: process.type,
      faulted: faulted
    })

    process.ticked = true
  }

  /**
    Add a process to the process table
    @param processClass The process class to use for this process
    @param name The name of this process, must be unique.
    @param priority The priority of this process. The higher the priority the more likely it is to be run.
    @param meta The meta data for this process. Needs to be JSONable so plain types only.
    @param parent (Optional) The name of the parent process.
  */
  addProcess<T extends ProcessTypes>(
    processClass: T,
    name: string,
    priority: number,
    meta: MetaData[T],
    parent?: string | undefined
  ){
    let process = new processTypes[processClass]({
      name: name,
      priority: priority,
      metaData: meta,
      suspend: false,
      parent: parent
    }, this)

    this.processTable[name] = process
  }

  /** Add a process to the process table if it does not exist */
  addProcessIfNotExist<T extends ProcessTypes>(
    processClass: T,
    name: string,
    priority: number,
    meta: MetaData[T]
  ){
    if(!this.hasProcess(name)){
      this.addProcess(processClass, name, priority, meta)
    }
  }

  /** No operation */
  noop(){}

  /** Send message to another process */
  sendIpc(sourceProcess: string, targetProcess: string, message: object){
    this.ipc.push({
      from: sourceProcess,
      to: targetProcess,
      message: message
    })
  }

  /** Get ipc messages for the given process */
  getIpc(targetProcess: string){
    return _.filter(this.ipc, function(entry){
      return (entry.to == targetProcess)
    })
  }

  /** get a process by name */
  getProcessByName(name: string){
   //console.log('<span style="color:#e74c3c;">[DEPRACATED]</span> lookup for ' + name + ' use getProcess(type, name) instead')
    return this.processTable[name]
  }

  /** Get a typed process */
  getProcess<T extends ProcessTypes>(processType: T, name: string){
    let proc = this.getProcessByName(name)
    if(proc && proc.type === processType){
      return <ProcessWithTypedMetaData<T>>proc
    }else{
      return false
    }
  }

  /** wait for the given process to complete and then runs cb */
  waitForProcess(name: string, thisArg: Process, cb: () => void){
    let proc = this.getProcessByName(name)

    if(!proc || proc.completed){
      cb.call(thisArg)
    }
  }

  /** does the given process exist in the process table */
  hasProcess(name: string): boolean{
    return (!!this.getProcessByName(name))
  }

  /** output a message to console */
  log(proc: Process, message: any){
    console.log('<span style="color:#3498db">{' + Game.time + '}[' + proc.name + ']</span> ' + message)
  }

  /** Remove the process if it exists */
  removeProcess(name: string){
    if(this.hasProcess(name)){
      let proc = this.getProcessByName(name)
      proc.completed = true
      proc.ticked = true
    }
  }

  /** Get processes by type */
  getProcessesByType(type: ProcessTypes){
    return _.filter(this.processTable, function(process){
      return (process.type === type)
    })
  }

  /** Get a processes type */
  getProcessType(processName: string){
    let proc = this.processTable[processName]
    if(proc){
      return <ProcessTypes>proc.type
    }else{
      return false
    }
  }
}
