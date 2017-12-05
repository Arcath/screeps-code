global.SCRIPT_VERSION = require('./version')

global.AOS_ALLIANCE = 'Overlords'
global.AOS_NO_AGRESS = ['GentGaming']

global.AOS_BOOST_PROCESS = 'boost'
global.AOS_BUILD_PROCESS = 'build'
global.AOS_BUILDER_LIFETIME_PROCESS = 'blf'
global.AOS_CLAIM_PROCESS = 'claim'
global.AOS_COLLECT_PROCESS = 'collect'
global.AOS_COURRIER_LIFETIME_PROCESS = 'courrierLifetime'
global.AOS_DELIVER_PROCESS = 'deliver'
global.AOS_DISTRO_LIFETIME_PROCESS = 'dlf'
global.AOS_ENERGY_MANAGEMENT_PROCESS = 'em'
global.AOS_FLAG_WATCHER_PROCESS = 'flagWatcher'
global.AOS_HARVEST_PROCESS = 'harvest'
global.AOS_HARVESTER_LIFETIME_PROCESS = 'hlf'
global.AOS_HOLD_PROCESS = 'hold'
global.AOS_HOLD_ROOM_PROCESS = 'holdRoom'
global.AOS_INIT_PROCESS = 'init'
global.AOS_LAB_MANAGEMENT_PROCESS = 'labManagement'
global.AOS_LOAN_DATA_PROCESS = 'loanData'
global.AOS_MINERAL_HARVEST_PROCESS = 'mh'
global.AOS_MINERAL_HARVESTER_LIFETIME_PROCESS = 'mhlf'
global.AOS_MINERAL_MANAGEMENT_PROCESS = 'mineralManagement'
global.AOS_MOVE_PROCESS = 'move'
global.AOS_RANGER_LIFETIME_PROCESS = 'rangerLifetime'
global.AOS_RANGER_MANAGEMENT_PROCESS = 'rangerManagement'
global.AOS_REMOTE_BUILDER_LIFETIME_PROCESS = 'rblf'
global.AOS_REMOTE_MINER_LIFETIME_PROCESS = 'rmlf'
global.AOS_REMOTE_MINING_MANAGEMENT_PROCESS = 'rmmp'
global.AOS_REPAIR_PROCESS = 'repair'
global.AOS_REPAIRER_LIFETIME_PROCESS = 'rlf'
global.AOS_ROOM_DATA_PROCESS = 'roomData'
global.AOS_ROOM_LAYOUT_PROCESS = 'roomLayout'
global.AOS_SHARD_MOVER_PROCESS = 'shardMover'
global.AOS_SOURCE_MAP_PROCESS = 'sourceMap'
global.AOS_SPAWN_REMOTE_BUILDER_PROCESS = 'spawnRemoteBuilder'
global.AOS_STRUCTURE_MANAGEMENT_PROCESS = 'sm'
global.AOS_SUSPENSION_PROCESS = 'suspend'
global.AOS_TOWER_DEFENSE_PROCESS = 'td'
global.AOS_TOWER_REPAIR_PROCESS = 'towerRepair'
global.AOS_TRANSPORTER_LIFETIME_PROCESS = 'transporterLifetime'
global.AOS_UPGRADE_PROCESS = 'upgrade'
global.AOS_UPGRADER_LIFETIME_PROCESS = 'ulf'

global.STATE_LOAD = 'load'
global.STATE_READ = 'read'

import {Kernel} from './os/kernel'
import {CreepTalk} from './vendor/creepTalk'
import {CreepTalkEmoji} from './vendor/creepTalk_emoji'

module.exports.loop = function(){
  console.log('[ARCOS] Begin Tick ' + Game.time)
  // Load Memory from the global object if it is there and up to date.
  if(global.lastTick && global.LastMemory && Game.time === (global.lastTick + 1)){
    delete global.Memory
    global.Memory = global.LastMemory
    RawMemory._parsed = global.LastMemory
  }else{
    Memory;
    global.LastMemory = RawMemory._parsed
    global.roomData = {}
  }
  global.lastTick = Game.time

  // Load CreepTalk
  new CreepTalk({
    public: true,
    language: CreepTalkEmoji
  })

  // Create a new Kernel
  let kernel = new Kernel

  // While the kernel is under the CPU limit
  while(kernel.underLimit() && kernel.needsToRun()){
    kernel.runProcess()
  }

  // Tear down the OS
  kernel.teardown()
}

module.exports.loaded = function(){
  return true
}
