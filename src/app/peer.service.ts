import { Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { BehaviorSubject, Subject, Subscriber, from, bindCallback, Observable, fromEvent } from 'rxjs';

import { map } from 'rxjs/operators';
import { MediaStreamDescriptor, DataChannelEventTypes, DataChannelEvent } from './models';

/** Issue with directly importing PeerJS */
import * as PeerJS from 'peerjs'; // included in angular.json
import { PeerUtils } from './peer.utils';
declare const Peer: typeof PeerJS; // import only to use type definitions



@Injectable({
  providedIn: 'root'
})
export class PeerService {

  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController) {
    this.destroyPeerOnWindowReload();
  }

  /** The peer holder */
  private peer: PeerJS;

  /** Will the the id of the currently logged user */
  public localId: string;

  /** Emits a @MediaStream whenever the local user allow to capture camera and mic */
  public localVideo$ = new BehaviorSubject<MediaStream>(null);
  /** Emits a @MediaStream whenever the remote user sends his stream */
  public remoteVideo$ = new BehaviorSubject<MediaStream>(null);
  /** Emits whenever the the remote stream must be swapped between the modal and the floating video */
  public floatingVideo$ = new BehaviorSubject<MediaStreamDescriptor>(null);

  /** The local stream. We need this reference to stop all tracks on hangUp() */
  private localStream: MediaStream;
  /** The remote stream. We need this reference to stop all tracks on hangUp() */
  private remoteStream: MediaStream;

  /** A connection between the local and remote peer. Only once can be established at time */
  private currentMediaConnection: PeerJS.MediaConnection;

  /** The max number of reconnection retries after a disconnection */
  private maxReconnectRetries = 10;
  /** The current number of reconnection retries after a disconnection */
  private currentReconnectRetries = 0;
  /** The number of milliseconds a reconnect is called after a disconnection */
  private reconnectionTimeout = 1500;

  /** The modal component to open when a call starts. Used this way to prevent circular dependency */
  private modalComponent: any;

  /** indicates if the local user is making a call or not */
  private isInCall = false;

  /**
   * Every time a user wants to call a peer it first establish a DataConnection. When a
   * DataConnection is opened it gets stored here. DataConnections are used to explicitly
   * send commands between peers without relying on the MediaConnection events (such as on 'close').
   */
  private dataConnections: { [remotePeerId: string]: PeerJS.DataConnection } = {};

  /**
   * Set the modal component
   * @param cmp The modal component to show when a call starts
   */
  public setModalComponent(cmp: any) {
    this.modalComponent = cmp;
    return this;
  }

  /**
   * Initialize the local peer and connects to the server. Must be called only once.
   * @param localPeerId The local peer id with which the local peer will be identified on the server by other peers.
   */
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

    // bind callbacks to class methods
    this.peer.on('open', this.onPeerConnectionOpen.bind(this));
    this.peer.on('call', this.onCallReceived.bind(this));
    this.peer.on('close', this.onClose.bind(this));
    this.peer.on('connection', this.onIncomingDataConnectionOpen.bind(this));
    this.peer.on('disconnected', this.onDisconnected.bind(this));
    this.peer.on('error', this.onError.bind(this));
  }

  /**
   * Called when the connection to the server is closed.
   */
  private onClose() {
    console.log('The connection to the server has been closed');
  }

  /**
   * Called whenever the local peer disconnects from the server. When disconnected
   * we try to reconnect for a few times before closing the current call.
   * @param peerId The local peer id
   */
  private onDisconnected(peerId: string) {
    console.log(`The peer ${peerId} is disconnected. Reconnecting...`);

    const reconnectionInterval = setInterval(() => {

      if (!this.peer.disconnected || this.peer.destroyed) {
        // sono connesso di nuovo
        this.currentReconnectRetries = 0;
        clearInterval(reconnectionInterval);
        return;
      }

      if (this.currentReconnectRetries < this.maxReconnectRetries) {
        this.peer.reconnect();
        this.currentReconnectRetries++;
      } else {
        this.currentReconnectRetries = 0;
        this.hangUp();
      }

    }, this.reconnectionTimeout);
  }

  /**
   * An unknown error occurred in the connection with the server
   * @param err The error
   */
  private onError(err) {
    console.error('Error in the connection', err);
  }

  /**
   * Called once when the local peer successfully connects to the server.
   * @param id The identifier of the local peer
   */
  private onPeerConnectionOpen(id: string) {
    console.log(`Current peer id is ${id}`);
    document.title = id; // TODO: remove
  }

  /**
   * Open a DataConnection towards the specified peer and stores it into the dataConnections.
   * @param remoteId The remote peer identifier
   */
  private openDataConnectionTowards(remoteId: string) {
    const dataConnection = this.dataConnections[remoteId] = this.peer.connect(remoteId);
    const open$ = PeerUtils.observableFromDataConnection<void>(dataConnection, 'open');
    return open$.pipe(map(() => dataConnection));
  }


  /**
   * Presents the modal component and starts the call to the remote peer.
   * @param remoteId The remote peer to call
   * @param withVideo Indicates if the call should be audio-only or not
   */
  private async presentCallUI(remoteId: string, withVideo: boolean) {
    // utente libero
    this.isInCall = true;

    navigator.getUserMedia({ video: withVideo, audio: true }, (stream) => {
      this.localStream = stream;
      this.localVideo$.next(this.localStream);

      this.currentMediaConnection = this.peer.call(remoteId, this.localStream, {
        metadata: {
          name: 'User ' + this.localId,
          withVideo
        }
      });

      this.currentMediaConnection.on('stream', (remoteStream) => {
        this.remoteStream = remoteStream;
        this.remoteVideo$.next(remoteStream);
        if (!!this.floatingVideo$.value) {
          this.floatingVideo$.next({
            hasVideo: withVideo,
            stream: this.remoteStream
          });
        }
      });
      this.showModal(withVideo);
    }, (error) => {
      this.handleError(error);
    });
  }

  /**
   * Initiate the process of starting a call. Opens a DataConnection to exchange info
   * before the real MediaConnection.
   * @param remoteId The remote peer to call
   * @param withVideo Indicates if the call should be audio-only or not
   */
  public async callPeerById(remoteId: string, withVideo: boolean) {

    if (this.isInCall) {
      console.log('Chiamata già in corso');
      return;
    }

    this.openDataConnectionTowards(remoteId)
      .subscribe(dataConnection => {

        console.log(`Sending BusyRequest...`);
        dataConnection.send({ type: DataChannelEventTypes.BusyRequest });

        PeerUtils.observableFromDataConnection<DataChannelEvent>(dataConnection, 'data')
          .subscribe(async msg => {
            console.log(`Received ${DataChannelEventTypes[msg.type]}`);
            switch (msg.type) {
              case DataChannelEventTypes.BusyResponse:
                const { isBusy } = msg.payload;
                if (isBusy) {
                  PeerUtils.showBusyCalleeAlert(this.alertCtrl);
                  this.hangUp();
                } else {
                  console.log(`Opening MediaConnection to ${remoteId}`);
                  this.presentCallUI(remoteId, withVideo);
                }
                break;
              case DataChannelEventTypes.CallClosed:
                // chiamata chiusa dal remote peer
                dataConnection.close();
                this.hangUp();
                break;
            }
          });
      });
  }

  /**
   * Closes the current call and notify the remote peer.
   */
  public closeCurrentCall() {
    this.dataConnections[this.currentMediaConnection.peer].send({ type: DataChannelEventTypes.CallClosed });
    this.hangUp();
  }

  /**
   * Stops all the tracks of the current call, closes the
   * floating video or the modal. Finally sets this peer as
   * available to receive another call.
   */
  private async hangUp() {

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
    this.floatingVideo$.next(null);

    const modal = await this.modalCtrl.getTop();
    if (modal) {
      modal.dismiss();
    }

    this.isInCall = false;
  }


  /**
   * Called whenever a remote peer tries to create a data connection with the local peer.
   * Handles the all the messages received in that channel until its closure.
   * @param dataConnection The DataConnection with the remote peer.
   */
  private onIncomingDataConnectionOpen(dataConnection: PeerJS.DataConnection) {

    this.dataConnections[dataConnection.peer] = dataConnection;
    console.log('Incoming data connection from peer ' + dataConnection.peer);

    PeerUtils.observableFromDataConnection<DataChannelEvent>(dataConnection, 'data')
      .subscribe(async msg => {
        console.log(`Received ${DataChannelEventTypes[msg.type]}`);
        switch (msg.type) {
          case DataChannelEventTypes.BusyRequest:
            console.log(`Sending BusyResponse. isBusy = ${this.isInCall}`);
            dataConnection.send({ type: DataChannelEventTypes.BusyResponse, payload: { isBusy: this.isInCall } });
            break;
          case DataChannelEventTypes.CallClosed:
            dataConnection.close();

            const alert = await this.modalCtrl.getTop();
            if (alert) {
              alert.dismiss();
            }
            this.hangUp();
        }
      });

  }

  /**
   * Called when a remote MediaConnection has been received from the local peer.
   * @param incomingCall The MediaConnection to which send the local stream and from which receive the remote one.
   */
  private async onCallReceived(incomingCall: PeerJS.MediaConnection) {

    console.log('Incoming call from peer ' + incomingCall.peer, incomingCall.metadata);

    if (this.isInCall) {
      console.log('Chiamata già in corso.');
      return;
    }

    const { withVideo } = incomingCall.metadata;
    const alert = await this.alertCtrl.create({
      header: incomingCall.metadata.name,
      message: 'Rispondere alla ' + (withVideo ? 'videochiamata' : 'chiamata') + '?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Annulla',
          handler: () => {
            incomingCall.close();
          }
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

  /**
   * Called when the local peer accepts an incoming call.
   * @param call The incoming call just accepted
   * @param withVideo Indicates if the call should be audio-only or not
   */
  private async onAnswerCall(call: PeerJS.MediaConnection, withVideo: boolean) {
    this.isInCall = true;
    this.currentMediaConnection = call;
    this.currentMediaConnection.on('close', () => this.hangUp());
    await navigator.getUserMedia({ video: withVideo, audio: true }, (stream) => {
      this.localStream = stream;
      this.currentMediaConnection.answer(this.localStream);
      this.localVideo$.next(this.localStream);
    }, (error) => {
      this.handleError(error);
    });

    this.currentMediaConnection.on('stream', (remoteStream) => {
      this.remoteStream = remoteStream;
      this.remoteVideo$.next(remoteStream);
    });
    this.showModal(withVideo);
  }



  public async showModal(video: boolean) {
    const modal = await this.modalCtrl.create({
      component: this.modalComponent,
      swipeToClose: true,
      backdropDismiss: false,
      componentProps: {
        video
      }
    });

    modal.onDidDismiss().then((e) => {
      if (e.role === 'gesture') {
        this.toggleModal(false, video);
      }
    });

    return modal.present();
  }


  public showFloatingVideo(video: boolean) {
    this.floatingVideo$.next({ stream: this.remoteStream, hasVideo: video });
  }

  public toggleModal(showModal: boolean, video: boolean) {
    if (showModal) {
      this.floatingVideo$.next(null);
      this.showModal(video);
    } else {
      this.modalCtrl.dismiss();
      this.showFloatingVideo(video);
    }
  }

  private async handleError(error: MediaStreamError) {
    if (error.name === 'NotAllowedError') {
      const alert = await this.alertCtrl.create({
        header: 'Permessi non attivati',
        message: `I permessi per l'accesso al microfono e/o telecamera sono disattivati nel tuo browser.
        Accedi alle impostazioni di quest'ultimo ed attiva i permessi.`,
        buttons: [
          {
            text: 'Ok',
            role: 'ok'
          }
        ]
      });
      this.hangUp();
      return alert.present();
    }
  }

  /**
   * Destroy the local peer and all its connections
   */
  private destroyPeerOnWindowReload() {
    window.onbeforeunload = () => {
      console.log('Disconnecting from server...');
      if (this.peer) {
        this.peer.destroy();
      }
    };
  }
}
