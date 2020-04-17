/** Issue with directly importing PeerJS */
import * as PeerJS from 'peerjs'; // included in angular.json
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

export class PeerUtils {

    public static observableFromDataConnection<T = unknown>(dataConnection: PeerJS.DataConnection, eventName: string) {
        return fromEvent<T>(dataConnection, eventName);
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