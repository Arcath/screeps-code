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
})
