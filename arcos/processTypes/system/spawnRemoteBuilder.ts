import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

import {RemoteBuilderLifetimeProcess} from '../lifetimes/remoteBuilder'

export class SpawnRemoteBuilderProcess extends Process{
  run(){
    let site = this.metaData.site

    if(!this.kernel.hasProcess('rblf-rb-' + site)){
      let spawned = Utils.spawn(
        this.kernel,
        Utils.nearestRoom(this.metaData.roomName, 500),
        'worker',
        'rb-' + Game.time,
        {}
      )

      if(spawned){
        this.kernel.addProcess(RemoteBuilderLifetimeProcess, 'rblf-rb-' + site, 70, {
          creep: 'rb-' + Game.time,
          site: site
        })
      }
    }

    this.completed = true
  }
}
