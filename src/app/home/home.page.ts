import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PeerService } from '../peer.service';
import * as ngswConfig from '../../../ngsw-config.json';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  remoteId: string;
  localId: string;
  version: string = ngswConfig.appData.version;

  constructor(public modalController: ModalController, public peerSvc: PeerService) {


  }


  public async startCall(video: boolean) {
    this.peerSvc.callPeerById(this.remoteId, video);
  }

}
