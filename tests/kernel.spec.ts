/// <reference types="typed-screeps" />
/// <reference path="../arcos/typings.d.ts" />

const gl: any = global

gl._ = require('lodash')

gl.CARRY = 'carry'
gl.CLAIM = 'claim'
gl.MOVE = 'move'
gl.RANGED_ATTACK = 'ranged_attack'
gl.TOUGH = 'tough'
gl.WORK = 'work'
gl.HEAL = 'heal'

global.Memory = {
  creeps: {},
  flags: {},
  rooms: {},
  spawns: {}
}

global.AOS_INIT_PROCESS = 'init'

const Kernel = require('../lib/os/kernel').Kernel
import {expect} from 'chai'

describe('Kernel', function(){
  it('should set the right limit for 10K Bucket', function(){
    gl.Game = {
      cpu: {
        bucket: 10000,
        tickLimit: 500,
        limit: 90
      }
    }

    var kernel = new Kernel

    expect(kernel.limit).to.equal(490)
  })

  it('should set the right limit for 7K Bucket', function(){
    gl.Game = {
      cpu: {
        bucket: 7000,
        tickLimit: 500,
        limit: 90
      }
    }

    var kernel = new Kernel

    expect(kernel.limit).to.equal(434)
  })

  it('should set the right limit for 4K Bucket', function(){
    gl.Game = {
      cpu: {
        bucket: 4000,
        tickLimit: 500,
        limit: 90
      }
    }

    var kernel = new Kernel

    expect(kernel.limit).to.equal(79)
  })

  it('should keep meta data for procsses', function(){
    gl.Game = {
      cpu: {
        bucket: 4000,
        tickLimit: 500,
        limit: 90,
        getUsed: function(){ return 9 }
      }
    }

    let kernel = new Kernel

    kernel.addProcess('move', 'test', 200, {})

    let proc = kernel.processTable['test']
    proc.metaData.test = true

    expect(proc.name).to.equal('test')

    let proc2 = kernel.getHighestProcess()
    expect(proc2.metaData.test).to.equal(true)
    proc2.metaData.test = false
    
    kernel.toRunProcesses = undefined

    let proc3 = kernel.getHighestProcess()

    expect(proc3.metaData.test).to.equal(false)
  })

  it('should teardown and rebuild correctly', function(){
    let kernel = new Kernel

    kernel.addProcess('move', 'test', 200, {
      test: true
    })

    let proc = kernel.getHighestProcess()
    expect(proc.metaData.test).to.equal(true)

    kernel.teardown(false)
    
    console.dir(Memory.arcos.processTable)
    let kernel2 = new Kernel

    let proc2 = kernel2.getHighestProcess()
    expect(proc2.metaData.test).to.equal(true)
    proc2.metaData.test = false

    kernel2.teardown(false)

    let kernel3 = new Kernel

    let proc3 = kernel3.getHighestProcess()
    expect(proc3.metaData.test).to.equal(false)
  })
})
