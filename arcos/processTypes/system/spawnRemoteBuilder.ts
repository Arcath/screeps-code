import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class SpawnRemoteBuilderProcess extends Process{
  type = AOS_SPAWN_REMOTE_BUILDER_PROCESS
  metaData: MetaData[AOS_SPAWN_REMOTE_BUILDER_PROCESS]

  run(){
    let site = this.metaData.site

    if(!site){
      this.completed = true
      return
    }

    if(!this.kernel.hasProcess('rblf-rb-' + site)){
      let spawned = Utils.spawn(
        this.kernel,
        Utils.nearestRoom(this.metaData.roomName, 500),
        'worker',
        'rb-' + Game.time,
        {}
      )

      if(spawned){
        this.kernel.addProcess(AOS_REMOTE_BUILDER_LIFETIME_PROCESS, 'rblf-rb-' + site, 70, {
          creep: 'rb-' + Game.time,
          site: site
        })
      }
    }

    this.completed = true
  }
}
