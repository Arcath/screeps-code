import {Process} from './process'

import {BuildProcess} from '../processTypes/creepActions/build'
import {BuilderLifetimeProcess} from '../processTypes/lifetimes/builder'
import {ClaimProcess} from '../processTypes/creepActions/claim'
import {CollectProcess} from '../processTypes/creepActions/collect'
import {DeliverProcess} from '../processTypes/creepActions/deliver'
import {DistroLifetimeProcess} from '../processTypes/lifetimes/distro'
import {EnergyManagementProcess} from '../processTypes/management/energy'
import {InitProcess} from '../processTypes/system/init'
import {HarvestProcess} from '../processTypes/creepActions/harvest'
import {HarvesterLifetimeProcess} from '../processTypes/lifetimes/harvester'
import {MoveProcess} from '../processTypes/creepActions/move'
import {RepairProcess} from '../processTypes/creepActions/repair'
import {RepairerLifetimeProcess} from '../processTypes/lifetimes/repairer'
import {StructureManagementProcess} from '../processTypes/management/structure'
import {SuspensionProcess} from '../processTypes/system/suspension'
import {UpgradeProcess} from '../processTypes/creepActions/upgrade'
import {UpgraderLifetimeProcess} from '../processTypes/lifetimes/upgrader'

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
  'move': MoveProcess,
  'repair': RepairProcess,
  'rlf': RepairerLifetimeProcess,
  'sm': StructureManagementProcess,
  'suspend': SuspensionProcess,
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
  /** The CPU Limit */
  limit = Game.cpu.limit - 10
  /** The process table */
  processTable: ProcessTable = {}
  /** IPC Messages */
  ipc: IPCMessage[] = []

  data = <KernelData>{
    roomData: {},
    usedSpawns: []
  }

  execOrder: string[] = []

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
    //  console.log(JSON.stringify(this.execOrder))
    //}

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

    try{
      process.run(this)
    }catch (e){
      console.log('process ' + process.name + ' failed with error ' + e)
    }

    this.execOrder.push(process.name + '(' + Math.round((Game.cpu.getUsed() - cpuUsed) * 10) / 10 + ')')

    process.ticked = true

    if(process.completed){
      this.addProcess(SuspensionProcess, 'suspension-post-' + process.name, 99, {master: false})
    }
  }

  /** Add a process to the process table */
  addProcess(processClass: any, name: string, priority: number, meta: {}){
    let process = new processClass({
      name: name,
      priority: priority,
      metaData: meta,
      suspend: false
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
