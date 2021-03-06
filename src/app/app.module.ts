import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { IonicModule, IonicRouteStrategy, ModalController, AlertController } from '@ionic/angular';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CallModalComponent } from './call-modal/call-modal.component';
import { CallFloatingVideoComponent } from './call-floating-video/call-floating-video.component';
import { AbsoluteDragDirective } from './absolute-drag.directive';



@NgModule({
  declarations: [AppComponent, CallModalComponent, CallFloatingVideoComponent, AbsoluteDragDirective],
  entryComponents: [CallModalComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
