import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { first } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { interval, concat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckForUpdateService {

  /**
   * Ogni volta che l'applicazione viene lanciata o viene
   * fatto il refresh di una pagina angular internamente
   * controlla che ci siano aggiornamenti per il service worker
   * (ogni build è una nuovo aggiornamento).
   *
   * Con un interval di un numero di ore specificato andiamo inoltre
   * a fare polling per evitare che un utente non veda mai aggiornamenti.
   */
  constructor(private appRef: ApplicationRef,
              private updates: SwUpdate,
              private toastController: ToastController) {

    this.updates.available.subscribe(event => {
      // ogni volta che ricevo un aggiornamento, mostra il toast
      this.onUpdateAvailable(event);
    });
  }

  /**
   * Schedula un interval per il controllo degli aggiornamenti
   * @param hours Il numero di ore ogni qual volta effettuare un check per gli aggiornamenti
   */
  scheduleUpdateEveryHours(hours: number) {
    // permettiamo all'app di stabilizzarsi in modo da non influenzare il tempo di avvio
    // isStable => sono stati processati tutti i micro e macro task
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));

    const everyHours$ = interval(hours * 60 * 60 * 1000);
    const everyHourOnceAppIsStable$ = concat(appIsStable$, everyHours$);

    everyHourOnceAppIsStable$.subscribe(() => {
      this.checkForUpdates();
    });
  }

  /**
   * Controlla che ci siano aggiornamenti. Se ne dovessero
   * essere presenti l'utente verrà avvisato
   */
  checkForUpdates() {
    this.updates.checkForUpdate();
  }

  /**
   * Visualizza un toast che chiede all'utente se vuole
   * aggiornare ora o ignorare.
   *
   * @param update L'aggiornamento disponibile
   */
  private async onUpdateAvailable(update: UpdateAvailableEvent) {
    // console.log('Update available', update);
    const toast = await this.toastController.create({
      header: `Aggiornamento disponibile (${update.available.appData['version']})`,
      position: 'top',
      buttons: [
        {
          side: 'start',
          text: 'Installa',
          cssClass: 'install-update-toast-button',
          handler: () => {
            this.updates.activateUpdate().then(() => document.location.reload());
          }
        },
        {
          role: 'cancel',
          icon: 'close-outline',
          cssClass: 'skip-update-toast-button'
        },
      ],
      keyboardClose: true
    });
    toast.present();
  }

}
