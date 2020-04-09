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
    this.peerSvc.setModalComponent(CallModalComponent);
  }


}
