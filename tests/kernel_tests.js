global._ = require('lodash')

global.CARRY = 'carry'
global.CLAIM = 'claim'
global.MOVE = 'move'
global.RANGED_ATTACK = 'ranged_attack'
global.TOUGH = 'tough'
global.WORK = 'work'
global.HEAL = 'heal'

global.Memory = {}

global.AOS_INIT_PROCESS = 'init'

const Kernel = require('../lib/os/kernel').Kernel
const expect = require('chai').expect

describe('Kernel', function(){
  it('should set the right limit for 10K Bucket', function(){
    global.Game = {
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
    global.Game = {
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
    global.Game = {
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
