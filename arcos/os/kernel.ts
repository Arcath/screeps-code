import {Process} from './process'

import {BuildProcess} from '../processTypes/creepActions/build'
import {BuilderLifetimeProcess} from '../processTypes/lifetimes/builder'
import {ClaimProcess} from '../processTypes/empireActions/claim'
import {CollectProcess} from '../processTypes/creepActions/collect'
import {DeliverProcess} from '../processTypes/creepActions/deliver'
import {DistroLifetimeProcess} from '../processTypes/lifetimes/distro'
import {EnergyManagementProcess} from '../processTypes/management/energy'
import {InitProcess} from '../processTypes/system/init'
import {HarvestProcess} from '../processTypes/creepActions/harvest'
import {HarvesterLifetimeProcess} from '../processTypes/lifetimes/harvester'
import {HoldRoomProcess} from '../processTypes/empireActions/hold'
import {HoldProcess} from '../processTypes/creepActions/hold'
import {MineralHarvestProcess} from '../processTypes/creepActions/mineralHarvest'
import {MineralharvesterLifetimeProcess} from '../processTypes/lifetimes/mineralHarvester'
import {MineralManagementProcess} from '../processTypes/management/mineral'
import {MoveProcess} from '../processTypes/creepActions/move'
import {RemoteBuilderLifetimeProcess} from '../processTypes/lifetimes/remoteBuilder'
import {RepairProcess} from '../processTypes/creepActions/repair'
import {RepairerLifetimeProcess} from '../processTypes/lifetimes/repairer'
import {StructureManagementProcess} from '../processTypes/management/structure'
import {SuspensionProcess} from '../processTypes/system/suspension'
import {TowerDefenseProcess} from '../processTypes/buildingProcesses/towerDefense'
import {UpgradeProcess} from '../processTypes/creepActions/upgrade'
import {UpgraderLifetimeProcess} from '../processTypes/lifetimes/upgrader'

import {Stats} from '../lib/stats'

const processTypes = <{[type: string]: any}>{
  'build': BuildProcess,
  'blf': BuilderLifetimeProcess,
  'claim': ClaimProcess,
  'collect': CollectProcess,
  'deliver': DeliverProcess,
  'dlf': DistroLifetimeProcess,
  'em': EnergyManagementProcess,
  'harvest': HarvestProcess,
  'hlf': HarvesterLifetimeProcess,
  'holdRoom': HoldRoomProcess,
  'hold': HoldProcess,
  'mh': MineralHarvestProcess,
  'mhlf': MineralharvesterLifetimeProcess,
  'mineralManagement': MineralManagementProcess,
  'move': MoveProcess,
  'rblf': RemoteBuilderLifetimeProcess,
  'repair': RepairProcess,
  'rlf': RepairerLifetimeProcess,
  'sm': StructureManagementProcess,
  'suspend': SuspensionProcess,
  'td': TowerDefenseProcess,
  'upgrade': UpgradeProcess,
  'ulf': UpgraderLifetimeProcess
}

interface KernelData{
  roomData: {
    [name: string]: RoomData
  }
  usedSpawns: string[]
}

interface ProcessTable{
  [name: string]: Process
}

export class Kernel{
  /** The CPU Limit for this tick */
  limit = Game.cpu.limit * 0.9
  /** The process table */
  processTable: ProcessTable = {}
  /** IPC Messages */
  ipc: IPCMessage[] = []

  data = <KernelData>{
    roomData: {},
    usedSpawns: []
  }

  execOrder: {}[] = []
  suspendCount = 0

  /**  Creates a new kernel ensuring that memory exists and re-loads the process table from the last. */
  constructor(){
    if(!Memory.arcos)
      Memory.arcos = {}

    this.loadProcessTable()

    this.addProcess(InitProcess, 'init', 99, {})
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
        //kernel.processTable.push(new processTypes[entry.type](entry, kernel))
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
      console.log('process ' + process.name + ' failed with error ' + e)
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

  /** Add a process to the process table */
  addProcess(processClass: any, name: string, priority: number, meta: {}, parent?: string | undefined){
    let process = new processClass({
      name: name,
      priority: priority,
      metaData: meta,
      suspend: false,
      parent: parent
    }, this)

    this.processTable[name] = process
  }

  /** Add a process to the process table if it does not exist */
  addProcessIfNotExist(processClass: any, name: string, priority: number, meta: {}){
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
    return this.processTable[name]
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
    console.log('[' + proc.name + '] ' + message)
  }

  /** Remove the process if it exists */
  removeProcess(name: string){
    if(this.hasProcess(name)){
      let proc = this.getProcessByName(name)
      proc.completed = true
      proc.ticked = true
    }
  }
}
