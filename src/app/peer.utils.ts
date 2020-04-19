/** Issue with directly importing PeerJS */
import * as PeerJS from 'peerjs'; // included in angular.json
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { DataChannelEventTypes } from './models';

export class PeerUtils {

    public static createMessage(type: DataChannelEventTypes, payload?: any) {
        return { type, payload };
    }

    /**
     * Displays an alert to indicate that the callee is busy.
     */
    public static async showBusyCalleeAlert(alertCtrl: AlertController) {
        // visualizzo messaggio utente busy
        const alert = await alertCtrl.create({ header: 'Utente occupato', buttons: [{ text: 'Ok', role: 'cancel' }] });
        alert.present();
    }

}