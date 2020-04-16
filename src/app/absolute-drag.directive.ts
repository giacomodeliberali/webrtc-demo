import { Directive, Input, ElementRef, Renderer, HostListener, Output, EventEmitter, Host } from '@angular/core';
import { DomController } from '@ionic/angular';
import Hammerjs from 'hammerjs';

@Directive({
  selector: '[absoluteDrag]'
})
export class AbsoluteDragDirective {

  @Input('startLeft') startLeft: any = 0;
  @Input('startTop') startTop: any = 0;
  @Input('padding') padding: any = 8;

  @Output('dragClicked') dragClicked: EventEmitter<null> = new EventEmitter<null>();

  private currentTop: any = 0;
  private currentLeft: any = 0;

  constructor(public element: ElementRef, public renderer: Renderer, public domCtrl: DomController) {
  }

  @HostListener('click', ['$event']) onClick(ev) {
    this.dragClicked.emit();
  }

  ngOnInit() {
    this.startLeft = this.padding;
    this.startTop = this.padding;
  }

  ngAfterViewInit() {


    this.renderer.setElementStyle(this.element.nativeElement, 'position', 'absolute');
    this.renderer.setElementStyle(this.element.nativeElement, 'left', this.startLeft + 'px');
    this.renderer.setElementStyle(this.element.nativeElement, 'top', this.startTop + 'px');

    let hammer = new Hammerjs(this.element.nativeElement);
    hammer.get('pan').set({ direction: Hammerjs.DIRECTION_ALL });

    hammer.on('panstart', (ev) => {
      this.renderer.setElementStyle(this.element.nativeElement, 'pointer-events', 'none');
      this.currentTop = (ev.center.y - this.currentTop);
      this.currentLeft = (ev.center.x - this.currentLeft);
    });

    hammer.on('pan', (ev) => {
      this.handlePan(ev);
    });

    hammer.on('panend', (ev) => {
      this.currentTop = this.element.nativeElement.offsetTop;
      this.currentLeft = this.element.nativeElement.offsetLeft;
      this.renderer.setElementStyle(this.element.nativeElement, 'pointer-events', 'auto');
    });
  }


  handlePan(ev) {
    let maxWidth = (window.innerWidth - this.element.nativeElement.offsetWidth - this.padding);
    let maxHeight = (window.innerHeight - this.element.nativeElement.offsetHeight - this.padding);
    let leftEl = ev.center.x - this.currentLeft;
    let topEl = ev.center.y - this.currentTop;
    let newLeft = (leftEl > maxWidth) ? maxWidth : ((leftEl < this.startLeft) ? this.startLeft : leftEl);
    let newTop = (topEl > maxHeight) ? maxHeight : ((topEl < this.startTop) ? this.startTop : topEl);

    this.domCtrl.write(() => {
      this.renderer.setElementStyle(this.element.nativeElement, 'left', newLeft + 'px');
      this.renderer.setElementStyle(this.element.nativeElement, 'top', newTop + 'px');
    });

  }

}
