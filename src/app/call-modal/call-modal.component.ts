import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PeerService } from '../peer.service';

@Component({
  selector: 'app-call-modal',
  templateUrl: './call-modal.component.html',
  styleUrls: ['./call-modal.component.scss'],
})
export class CallModalComponent implements OnInit {

  @Input() video: boolean;
  @Input() remoteId: string;

  @ViewChild('localVideo', { read: ElementRef, static: true }) localVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { read: ElementRef, static: true }) remoteVideo: ElementRef<HTMLVideoElement>;

  constructor(private modalCtrl: ModalController, private peerSvc: PeerService) { }

  ngOnInit() {
    this.peerSvc.localVideo$.subscribe(localStream => {
      console.log('localStream received', localStream);
      this.localVideo.nativeElement.srcObject = localStream;
    });
    this.peerSvc.remoteVideo$.subscribe(remoteStream => {
      console.log('remoteStream received', remoteStream);
      this.remoteVideo.nativeElement.srcObject = remoteStream;
    });
  }

  public dismissModal() {
    this.modalCtrl.dismiss();
  }

}
