import {Process} from '../../os/process'

export class TowerRepairProcess extends Process{
  type = AOS_TOWER_REPAIR_PROCESS
  metaData: MetaData[AOS_TOWER_REPAIR_PROCESS]

  run(){
    if(!Game.rooms[this.metaData.roomName]){
      this.completed = true
      return
    }

    if(Game.rooms[this.metaData.roomName].find(FIND_HOSTILE_CREEPS).length > 0){
      return
    }

    let ramparts = _.filter(this.roomData().ramparts, function(rampart){
      return (rampart.hits < 50000)
    })

    let containers = _.filter(this.roomData().generalContainers, function(container){
      return (container.hits < container.hitsMax)
    })

    let sourceContainers = _.filter(this.roomData().sourceContainers, function(container){
      return (container.hits < container.hitsMax)
    })

    let roads = _.filter(this.roomData().roads, function(road){
      return (road.hits < road.hitsMax)
    })

    let sortedRamparts = _.sortBy(<Structure[]>[].concat(
      <never[]>ramparts,
      <never[]>containers,
      <never[]>sourceContainers,
      <never[]>roads
    ), 'hits')
    let usedTowers = <{[towerId: string]: boolean}>{}

    _.forEach(this.roomData().towers, function(tower){
      usedTowers[tower.id] = (tower.energy < 500)
    })

    let proc = this
    _.forEach(sortedRamparts, function(rampart){
      let towers = _.filter(proc.roomData().towers, function(tower){
        return !usedTowers[tower.id]
      })

      if(towers.length > 0){
        let tower = rampart.pos.findClosestByRange(towers)

        tower.repair(rampart)

        usedTowers[tower.id] = true
      }
    })
  }
}
