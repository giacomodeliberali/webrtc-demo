import { Component } from '@angular/core';
import { CallModalComponent } from './call-modal/call-modal.component';
import { PeerService } from './peer.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private peerSvc: PeerService) {

    const between = (min: number, max: number) => {
      return Math.floor(
        Math.random() * (max - min) + min
      ).toString();
    }

    //TODO: use real id
    this.peerSvc.init(between(1, 100));
    this.peerSvc.setModalComponent(CallModalComponent);
  }


}
