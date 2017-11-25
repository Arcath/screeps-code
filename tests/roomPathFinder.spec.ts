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

const RoomPathFinder = require('../lib/lib/roomPathFinder').RoomPathFinder
const Utils = require('../lib/lib/utils').Utils

import {expect} from 'chai'

const roomNameToXY = function(name: string){
    name = name.toUpperCase();
    var match = name.match(/^(\w)(\d+)(\w)(\d+)$/);
    if(!match) {
        return [undefined, undefined];
    }
    var [,hor,xS,ver,yS] = match;

    let x = parseInt(xS)
    let y = parseInt(yS)

    if(hor == 'W') {
        x = -x-1;
    }
    else {
        x = +x;
    }
    if(ver == 'N') {
        y = -y-1;
    }
    else {
        y = +y;
    }
    return [x,y];
}

describe('Room Path Finder', function(){
  before(function(){
      gl.roomMaps = require('./data/map.json')

      gl.Game = {
        map: {
          describeExits: function(roomName: string){
            if(gl.roomMaps.exits[roomName]){
              return gl.roomMaps.exits[roomName]
            }else{
              throw roomName + '\'s exits are not on file'
            }
          },

          getRoomLinearDistance: function(room1: string, room2: string){
            var [x1,y1] = roomNameToXY(room1);
            var [x2,y2] = roomNameToXY(room2);
            if(x1 === undefined || x2 === undefined || y1 === undefined || y2 === undefined){
              return 0
            }
            var dx = Math.abs(x2-x1);
            var dy = Math.abs(y2-y1);

            return Math.max(dx, dy);
          },

          getWorldSize(){
            return 122
          }
        },
        rooms: {
          'W31N59': {
            controller: { my: true },
            energyCapacityAvailable: 100,
            name: 'W31N59'
          },
          'W32N56': {
            controller: { my: true },
            energyCapacityAvailable: 100,
            name: 'W32N56'
          }
        },
        cpu: {
          getUsed: function(){
            return 10
          }
        }
      }

      gl._ = require('lodash')
  })

  it('should get linear distance correctly', function(done){
    _.forEach(Object.keys(gl.roomMaps.distance), function(key){
      var rooms = key.split('-')

      expect(Game.map.getRoomLinearDistance(rooms[0], rooms[1])).to.equal(gl.roomMaps.distance[key])
    })
    done()
  })

  it('should find a path', function(done){
    var path = new RoomPathFinder('W34N59', 'W32N57')

    expect(path.results().length).to.not.equal(0)
    done()
  })

  /*it('should find the best path (W34N59 to W32N57)', function(done){
    var path = new RoomPathFinder('W34N59', 'W32N57')

    console.dir(path.results().details)

    expect(path.results().length).to.equal(7)
    expect(path.results().details[3]).to.equal('W34N56')
    done()
  })*/

  it('should find the best path (W36N59 to W31N59)', function(done){
    var path = new RoomPathFinder('W36N59', 'W31N59')

    expect(path.results().length).to.equal(8)

    expect(path.results().details[0]).to.equal('W36N59')
    expect(path.results().details[1]).to.equal('W35N59')
    expect(path.results().details[2]).to.equal('W35N60')

    done()
  })

  it('should find the best room', function(done){
    var roomName = Utils.nearestRoom('W36N59')

    expect(roomName).to.equal('W31N59')

    done()
  })
})
