import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PeerService } from '../peer.service';

@Component({
  selector: 'app-call-floating-video',
  templateUrl: './call-floating-video.component.html',
  styleUrls: ['./call-floating-video.component.scss'],
})
export class CallFloatingVideoComponent implements OnInit {

  @ViewChild('remoteVideo', { read: ElementRef, static: true }) remoteVideo: ElementRef<HTMLVideoElement>;

  public showVideo = false;

  constructor(private peerSvc: PeerService) {
  }

  ngOnInit() {
    this.peerSvc.floatingVideo$.subscribe(remoteStreamDescriptor => {
      if (remoteStreamDescriptor) {
        this.showVideo = true;
        this.remoteVideo.nativeElement.srcObject = remoteStreamDescriptor.stream;
        this.remoteVideo.nativeElement.muted = false;
        this.remoteVideo.nativeElement.play();
      } else {
        this.remoteVideo.nativeElement.srcObject = null;
        this.showVideo = false;
      }
    });
  }

  toggleModal() {
    this.peerSvc.toggleModal(true, true);
  }

}
