global.SCRIPT_VERSION = require('./version')

import {Kernel} from './os/kernel'

module.exports.loop = function(){
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

  // Create a new Kernel
  let kernel = new Kernel

  // While the kernel is under the CPU limit
  while(kernel.underLimit() && kernel.needsToRun()){
    kernel.runProcess()
  }

  // Tear down the OS
  kernel.teardown()
}
