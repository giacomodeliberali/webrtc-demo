import { Component } from '@angular/core';
import { CallModalComponent } from './call-modal/call-modal.component';
import { PeerService } from './peer.service';
import { CheckForUpdateService } from './check-for-update.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private peerSvc: PeerService, private checkForUpdateSvc: CheckForUpdateService) {

    if (environment.production) {
      this.checkForUpdateSvc.checkForUpdates();
    }

    const between = (min: number, max: number) => {
      return Math.floor(
        Math.random() * (max - min) + min
      ).toString();
    }

    //TODO: use real id
    this.peerSvc.init(between(1, 1000));
    this.peerSvc.setModalComponent(CallModalComponent);
  }


}
