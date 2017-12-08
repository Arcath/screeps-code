import {Process} from '../../os/process'

interface InterShardMessage{
  /** The shard that this message came from */
  from: string
  /** The shard this message is for. */
  to: string
  /** The tick that the message was sent on the `from` shard. */
  sent: number
  /** 
   * The state of this message
   * 
   * If STATE_WRITE the message was written in the current tick on the sending shard.
   * If STATE_CONFIRMED the message was written last tick and confirmed valid.
   * If STATE_READ the message has been read
   */
  state: STATE_WRITE | STATE_CONFIRMED | STATE_READ
  message: {
    /** The type of the message */
    type: string
    /** A JSON string of meta data to pass into the target */
    metaData: string
  }
}

export class InterShardProcess extends Process{
  type = AOS_INTER_SHARD_PROCESS
  metaData: MetaData[AOS_INTER_SHARD_PROCESS]

  shards(){
    return _.filter(Object.keys(Game.cpu.shardLimits), function(shardName){
      return Game.cpu.shardLimits[shardName] > 0
    })
  }

  run(){
    if(Game.shard.name === 'shard1'){
      this.log(JSON.stringify(this.metaData))
      this.log(RawMemory.interShardSegment)
    }

    if(!RawMemory.interShardSegment){
      RawMemory.interShardSegment = JSON.stringify({})
    }

    if(!this.metaData.shardData){
      this.metaData.shardData = {}
    }

    if(this.metaData.lastShard === null){
      this.metaData.lastShard = 0
      this.metaData.data = undefined
    }

    if(!this.metaData.data && Game.time % 100){
      this.metaData.data = {
        type: 'ping',
        target: this.shards()[this.metaData.lastShard!],
        metaData: JSON.stringify({
          roomCount: _.filter(Game.rooms, function(room){
            return (room.controller && room.controller.my)
          }).length
        })
      }

      this.metaData.lastShard! += 1

      if(this.shards()[this.metaData.lastShard!] === Game.shard.name){
        this.metaData.lastShard! += 1      
      }

      if(this.metaData.lastShard! > this.shards().length){
        this.metaData.lastShard = 0
      }
    }

    if(this.metaData.state === STATE_READ){
      this.read()
    }else if(this.metaData.state === STATE_WRITE){
      this.write()
    }
  }

  read(){
    let data: InterShardMessage = JSON.parse(RawMemory.interShardSegment)

    if(data.from && data.from === Game.shard.name && data.sent < (Game.time - 10)){
      RawMemory.interShardSegment = JSON.stringify({})
      return
    }

    if(!data.to){
      //No Data, shall we see if its time to write?
      if(this.metaData.data){
        this.metaData.state = STATE_WRITE

        return
      }
    }

    if(data.to && data.to === Game.shard.name && data.state === STATE_CONFIRMED){
      this.log('Message from ' + data.from)

      if(data.message.type === 'ping'){
        this.ping(data)
      }
    }
  }

  write(){
    let data: InterShardMessage = JSON.parse(RawMemory.interShardSegment)

    if(!data.from){
      // No Data, safe to write
      let newData: InterShardMessage = {
        from: Game.shard.name,
        to: this.metaData.data!.target,
        sent: Game.time,
        state: STATE_WRITE,
        message: {
          type: this.metaData.data!.type,
          metaData: this.metaData.data!.metaData
        }
      }

      RawMemory.interShardSegment = JSON.stringify(newData)
    }else{
      this.read()
    }
    
    if(data.from && data.from === Game.shard.name && data.state === STATE_WRITE){
      if(data.message.metaData === this.metaData.data!.metaData && data.message.type === this.metaData.data!.type){
        data.state = STATE_CONFIRMED
        RawMemory.interShardSegment = JSON.stringify(data)
      }else{
        this.log('<span style="color:#e74c3c">[ERROR]</span> My data has been manipulated by another shard')
        this.metaData.state = STATE_READ
      }

      return
    }

    if(data.from && data.from === Game.shard.name && data.state === STATE_READ){
      // The data has been read, BLANK THE DATA
      RawMemory.interShardSegment = JSON.stringify({})
      
      this.metaData.state = STATE_READ      
      this.metaData.data = undefined
    }

    if(data.from && data.from === Game.shard.name && data.state === STATE_CONFIRMED && data.sent < (Game.time - 10)){
      // It has been 10 ticks with no read, BLANK THE DATA
      this.log('Message not read')
      RawMemory.interShardSegment = JSON.stringify({})

      this.metaData.state = STATE_READ
      this.metaData.data = undefined      
    }
  }

  /** Saves the message to the shard data object */
  ping(data: InterShardMessage){
    this.metaData.shardData![data.from] = JSON.parse(data.message.metaData)

    data.state = STATE_READ
    RawMemory.interShardSegment = JSON.stringify(data)
  }
}