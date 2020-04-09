import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PeerService } from '../peer.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  remoteId: string;
  localId: string;

  constructor(public modalController: ModalController, public peerSvc: PeerService) {


  }


  public async startCall(video: boolean) {
    this.peerSvc.initCall(this.remoteId, video);
  }

}
