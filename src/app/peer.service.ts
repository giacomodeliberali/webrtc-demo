import { Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { BehaviorSubject, Subject, Subscriber } from 'rxjs';

// included in angular.json
import * as PeerJS from 'peerjs'; // import only to use dts
declare const Peer: typeof PeerJS;

interface Event {
  type: string;
}
const EventTypes: { [key: string]: Event } = {
  Busy: { type: 'busy' }
};

@Injectable({
  providedIn: 'root'
})
export class PeerService {

  private peer: PeerJS;

  public onCallStart$ = new Subject<any>();

  public onBusyCallee$ = new Subject();

  // -- CHIAMANTE --
  public isWaitingForAnswer = new Subject<boolean>();
  /* public onBusyCallee = new Subject<boolean>(); */
  public onCallAnswer = new Subject<boolean>();

  // -- CHIAMATO --
  public onIncomingCall = new Subject<boolean>();

  // sarà l'id dell'utente loggato
  public localId: string;

  public localVideo$ = new BehaviorSubject<MediaStream>(null);
  public remoteVideo$ = new BehaviorSubject<MediaStream>(null);
  public onCallClosed$ = new BehaviorSubject<boolean>(false);

  private localStream: MediaStream;
  private remoteStream: MediaStream;

  private currentMediaConnection: PeerJS.MediaConnection;

  private modalComponent: any;

  public setModalComponent(cmp: any) {
    this.modalComponent = cmp;
    return this;
  }

  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController) {

  }

  public init(localPeerId: string) {

    if (this.localId) {
      throw new Error('Il peer è già stato inizializzato.');
    }

    this.localId = localPeerId;

    this.peer = new Peer(this.localId, {
      host: 'webrtc-peerjs.azurewebsites.net',
      port: 443,
      path: '/'
      // , debug: 3
    });

    // this.peer = new Peer();

    /* this.peer = new Peer(this.localId, {
      host: '192.168.1.226',
      port: 5001,
      path: '/'
    }); */

    this.peer.on('open', this.onPeerConnectionOpen.bind(this));

    this.peer.on('call', this.onCallReceived.bind(this));

    this.peer.on('close', this.onClose.bind(this));
    this.peer.on('connection', this.onConnection.bind(this));
    this.peer.on('disconnected', this.onDisconnected.bind(this));
    this.peer.on('error', this.onError.bind(this));
  }

  private onClose(...args) {
    console.log('onClose', ...args);
  }

  private onConnection(connection: PeerJS.DataConnection) {
    console.log('onConnection', connection);
    connection.on('data', (data: Event) => {
      switch (data.type) {
        case EventTypes.Busy.type:
          this.onBusyCallee(connection);
          break;
        default:
          console.log('Data received', data);
      }
    });
  }

  private onDisconnected(peerId: string) {
    console.log('onDisconnected', peerId);
  }

  private onError(err) {
    console.log('onError', err);
  }

  private onPeerConnectionOpen(id: string) {
    console.log(`My id is ${id}`);
    document.title = id;
  }
  private async onBusyCallee(dataConnection: PeerJS.DataConnection) {
    // chiuso la connessione dati che mi ha mandato il messaggio busy
    dataConnection.close();
    this.onCallClosed$.next(true);

    // chiudo la chiamata che stavo provando a fare
    this.hangUp();

    // visualizzo messaggio utente busy
    const alert = await this.alertCtrl.create({ header: 'Utente occupato', buttons: [{ text: 'Ok', role: 'cancel' }] });
    alert.present();
  }

  public async callPeerById(remoteId: string, withVideo: boolean) {
    try {
      if (this.currentMediaConnection && this.currentMediaConnection.open) {
        console.log('Chiamata già in corso');
        return;
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({ video: withVideo, audio: true });
      this.localVideo$.next(this.localStream);

      this.currentMediaConnection = this.peer.call(remoteId, this.localStream, {
        metadata: {
          name: 'User ' + this.localId,
          withVideo
        }
      });

      this.currentMediaConnection.on('close', () => this.hangUp());


      this.currentMediaConnection.on('stream', (remoteStream) => {
        this.remoteStream = remoteStream;
        this.remoteVideo$.next(remoteStream);
      });

      this.showModal(withVideo);

    } catch (ex) {
      console.error(ex);
    }
  }

  public hangUp() {

    if (!this.currentMediaConnection) {
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

    if (this.currentMediaConnection) {
      this.currentMediaConnection.close();
    }

    console.log('Active connections', this.peer.connections);

    this.onCallClosed$.next(true);
  }


  private async onCallReceived(incomingCall: PeerJS.MediaConnection) {
    console.log('Incoming call from peer ' + incomingCall.peer, incomingCall.metadata);
    if (this.currentMediaConnection && this.currentMediaConnection.open) {
      console.log('Chiamata già in corso.');
      const dataChannel = this.peer.connect(incomingCall.peer);
      dataChannel.on('open', () => {
        dataChannel.send(EventTypes.Busy);
        incomingCall.close();
      });
      return;
    }

    const { withVideo } = incomingCall.metadata;
    const alert = await this.alertCtrl.create({
      header: incomingCall.metadata.name,
      message: 'Rispondere alla ' + (withVideo ? 'videochiamata' : 'chiamata') + '?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Rispondi',
          handler: () => {
            this.onAnswerCall(incomingCall, withVideo);
          }
        }
      ]
    });

    return alert.present();
  }

  private async onAnswerCall(call: PeerJS.MediaConnection, withVideo: boolean) {
    this.currentMediaConnection = call;
    this.currentMediaConnection.on('close', () => this.hangUp());
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: withVideo, audio: true });
    this.currentMediaConnection.answer(this.localStream);
    this.localVideo$.next(this.localStream);
    this.currentMediaConnection.on('stream', (remoteStream) => {
      this.remoteStream = remoteStream;
      this.remoteVideo$.next(remoteStream);
    });
    this.showModal(withVideo);
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
