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
  public localId = Math.random().toString(36).substring(3);

  public localVideo$ = new BehaviorSubject<MediaStream>(null);
  public remoteVideo$ = new BehaviorSubject<MediaStream>(null);

  private currentCall: PeerJS.MediaConnection;

  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController) {

    this.peer = new Peer(this.localId, {
      host: 'webrtc-peerjs.azurewebsites.net',
      port: 443,
      path: '/'
    });

    this.peer.on('open', this.onPeerConnectionOpen.bind(this));

    this.peer.on('call', this.onCallReceived.bind(this));
  }

  private onPeerConnectionOpen(id: number) {
    console.log(`My id is ${id}`);
  }

  private async onCallReceived(call: PeerJS.MediaConnection) {
    console.log('onCallReceived');
    if (this.currentCall) {
      call.close();
      console.log('Chiamata già in corso');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Chiamata in arrivo',
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
    this.currentCall = call;
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.currentCall.answer(localStream);
    this.localVideo$.next(localStream);
    this.currentCall.on('stream', (remoteStream) => {
      this.remoteVideo$.next(remoteStream);
    });

    this.currentCall.on('close', () => {
      this.currentCall = null;
    });
  }

  public async initCall(remoteId: string, video: boolean, component: any) {
    if (this.currentCall) {
      console.log('Chiamata già in corso');
      return;
    }

    const localStream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
    this.localVideo$.next(localStream);

    this.currentCall = this.peer.call(remoteId, localStream);

    this.currentCall.on('stream', (remoteStream) => {
      this.remoteVideo$.next(remoteStream);
    });

    this.currentCall.on('close', () => {
      this.currentCall = null;
    });

    this.showModal(video, component);
  }

  private async showModal(video: boolean, component: any) {
    const modal = await this.modalCtrl.create({
      component,
      componentProps: {
        video
      }
    });
    return modal.present();
  }

}
