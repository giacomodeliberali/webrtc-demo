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

  public hasRemoteStream = false;
  public hasLocalStream = false;


  constructor(public peerSvc: PeerService) { }

  async ngOnInit() {

    this.localVideo.nativeElement.oncanplay = () => {
      this.hasLocalStream = true;
    };
    this.remoteVideo.nativeElement.oncanplay = () => {
      this.hasRemoteStream = true;
    };

    this.peerSvc.localVideo$.subscribe(localStream => {
      this.localVideo.nativeElement.srcObject = localStream;
      this.localVideo.nativeElement.muted = true;
      this.localVideo.nativeElement.play();
    });
    this.peerSvc.remoteVideo$.subscribe(remoteStream => {
      this.remoteVideo.nativeElement.srcObject = remoteStream;
      this.remoteVideo.nativeElement.muted = false;
      this.localVideo.nativeElement.play();
    });


    // TODO: debug
    /*     const localStreamDebug = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        this.localVideo.nativeElement.oncanplay = () => {
          this.hasLocalStream = true;
        };
        this.localVideo.nativeElement.srcObject = localStreamDebug;
        this.localStream = localStreamDebug;
        this.localVideo.nativeElement.muted = true;


        this.remoteStream = localStreamDebug;
        this.remoteVideo.nativeElement.srcObject = localStreamDebug;
        this.remoteVideo.nativeElement.muted = true; */
  }


  public dismissModal() {
    this.peerSvc.toggleModal(false, this.video);
  }

  public async hangUp() {
    this.peerSvc.closeCurrentCall();
  }
}
