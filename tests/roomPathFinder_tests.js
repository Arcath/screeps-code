global.CARRY = 'carry'
global.CLAIM = 'claim'
global.MOVE = 'move'
global.RANGED_ATTACK = 'ranged_attack'
global.TOUGH = 'tough'
global.WORK = 'work'
global.HEAL = 'heal'

const RoomPathFinder = require('../lib/lib/roomPathFinder').RoomPathFinder
const Utils = require('../lib/lib/utils').Utils

const expect = require('chai').expect

const roomNameToXY = function(name){
    name = name.toUpperCase();
    var match = name.match(/^(\w)(\d+)(\w)(\d+)$/);
    if(!match) {
        return [undefined, undefined];
    }
    var [,hor,x,ver,y] = match;

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
      global.roomMaps = require('./data/map.json')

      global.Game = {
        map: {
          describeExits: function(roomName){
            if(global.roomMaps.exits[roomName]){
              return global.roomMaps.exits[roomName]
            }else{
              throw roomName + '\'s exits are not on file'
            }
          },

          getRoomLinearDistance: function(room1, room2){
            var [x1,y1] = roomNameToXY(room1);
            var [x2,y2] = roomNameToXY(room2);
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

      global._ = require('lodash')
  })

  it('should get linear distance correctly', function(done){
    _.forEach(Object.keys(global.roomMaps.distance), function(key){
      var rooms = key.split('-')

      expect(Game.map.getRoomLinearDistance(rooms[0], rooms[1])).to.equal(global.roomMaps.distance[key])
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
