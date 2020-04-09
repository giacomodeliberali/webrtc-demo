import { Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import * as PeerJS from 'peerjs';
import { BehaviorSubject } from 'rxjs';
declare const Peer: typeof PeerJS;

@Injectable({
  providedIn: 'root'
})
export class PeerService {

  private peer: PeerJS;

  // sarà l'id dell'utente loggato
  public localId$ = new BehaviorSubject<string>(Math.random().toString(36).substring(3));

  public localVideo$ = new BehaviorSubject<MediaStream>(null);
  public remoteVideo$ = new BehaviorSubject<MediaStream>(null);
  public isCallClosed$ = new BehaviorSubject<boolean>(false);

  private localStream: MediaStream;
  private remoteStream: MediaStream;

  private mediaConnection: PeerJS.MediaConnection;

  private modalComponent: any;

  public setModalComponent(cmp: any) {
    this.modalComponent = cmp;
    return this;
  }

  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController) {

    this.peer = new Peer(this.localId$.value, {
      host: 'webrtc-peerjs.azurewebsites.net',
      port: 443,
      path: '/'
    });

    // this.peer = new Peer();

    /* this.peer = new Peer(this.localId, {
      host: '192.168.1.226',
      port: 5001,
      path: '/'
    }); */

    this.peer.on('open', this.onPeerConnectionOpen.bind(this));

    this.peer.on('call', this.onCallReceived.bind(this));
  }

  private onPeerConnectionOpen(id: string) {
    console.log(`My id is ${id}`);
    this.localId$.next(id);
  }

  public async initCall(remoteId: string, video: boolean) {
    try {
      if (this.mediaConnection && this.mediaConnection.open) {
        console.log('Chiamata già in corso');
        return;
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      this.localVideo$.next(this.localStream);

      // la mediaConnection viene ritornata solo la prima volta e successivamente solamente chiusa
      const call = this.peer.call(remoteId, this.localStream, {
        metadata: {
          name: 'User ' + this.localId$.value
        }
      });
      console.log('Call: ', call);
      this.mediaConnection = this.mediaConnection || call;

      this.mediaConnection.on('close', () => this.hangUp());

      this.mediaConnection.on('stream', (remoteStream) => {
        this.remoteStream = remoteStream;
        this.remoteVideo$.next(remoteStream);
      });

      this.showModal(video);

    } catch (ex) {
      console.error(ex);
    }
  }

  public hangUp() {
    if (!this.mediaConnection) {
      return;
    }

    const stopTracks = (mediaStream: MediaStream) => {
      if (mediaStream) {
        for (const track of mediaStream.getTracks()) {
          track.stop();
        }
      }
    };

    stopTracks(this.localStream);
    stopTracks(this.remoteStream);

    if (this.mediaConnection.open) {
      this.mediaConnection.close();
    }
    this.isCallClosed$.next(true);
  }


  private async onCallReceived(call: PeerJS.MediaConnection) {
    console.log('onCallReceived');
    if (this.mediaConnection && this.mediaConnection.open) {
      console.log('Chiamata già in corso');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: call.metadata.name,
      message: 'Rispondere alla chiamata?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Rispondi',
          handler: () => {
            this.onAnswerCall(call);
          }
        }
      ]
    });

    return alert.present();
  }

  private async onAnswerCall(call: PeerJS.MediaConnection) {
    this.mediaConnection = call;
    this.mediaConnection.on('close', () => this.hangUp());
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.mediaConnection.answer(this.localStream);
    this.localVideo$.next(this.localStream);
    this.mediaConnection.on('stream', (remoteStream) => {
      this.remoteStream = remoteStream;
      this.remoteVideo$.next(remoteStream);
    });
    this.showModal(true);
  }



  public async showModal(video: boolean) {
    const modal = await this.modalCtrl.create({
      component: this.modalComponent,
      componentProps: {
        video
      }
    });
    return modal.present();
  }

}
