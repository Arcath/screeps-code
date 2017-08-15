let TerminalActor = {
  run: function(rooms: SODB){
    let terminalRooms = <ObjectRoom[]>rooms.where({mine: true}, {terminal: {defined: true}})

    let sendRooms = <StructureTerminal[]>[]
    let recRooms = <StructureTerminal[]>[]

    _.forEach(terminalRooms, function(roomObject){
      let terminal = <StructureTerminal>Game.getObjectById(roomObject.terminal)
      let storage = <StructureStorage>Game.getObjectById(roomObject.storage)

      if(terminal.store.energy > 105000){
        sendRooms.push(terminal)
      }else{
        if(storage.store.energy < 300000){
          recRooms.push(terminal)
        }
      }

      if(terminal.store.energy > 2000){
        _.forEach(Object.keys(terminal.store), function(resource){
          if(resource != RESOURCE_ENERGY && terminal.store[resource] > 1001){
            let orders = _.filter(Game.market.getAllOrders(), function(order){
              return (
                order.resourceType == resource
                &&
                order.type == ORDER_BUY
                &&
                Game.market.calcTransactionCost(1000, terminal.room.name, order.roomName!) < 5000
              )
            })

            if(orders.length){
              let best = _.sortBy(orders, 'price')[0]

              Game.market.deal(best.id, _.min([best.amount, terminal.store[resource]]), terminal.room.name)
            }
          }
        })
      }
    })

    _.forEach(recRooms, function(recTerm){
      let needed = 105000 - recTerm.store.energy

      if(sendRooms.length){
        _.forEach(sendRooms, function(sendTerm){
          if(needed > 0 && sendTerm.cooldown == 0){
            sendTerm.send(RESOURCE_ENERGY, needed, recTerm.room.name)
            needed = 0
          }
        })
      }
    })
  }
}

module.exports = TerminalActor
