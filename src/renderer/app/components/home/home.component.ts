import { Component, OnInit, ViewChild, ElementRef, Renderer2, Input, OnDestroy } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import * as _ from 'lodash';
import { IpcRendererService } from '../../providers/ipc.renderer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('photo', { static: false }) photoChild: ElementRef;

  constructor(private renderer: Renderer2, private ipcRenderer: IpcRendererService) {
    this.onCollage = this.onCollage.bind(this);
  }

  ngOnInit() {
    this.ipcRenderer.on("collage", this.onCollage);
  }

  ngOnDestroy() {
    this.ipcRenderer.removeListener("collage", this.onCollage);
  }

  updateCollage() {
    this.ipcRenderer.send("create-collage", { template: 'default', photos: [] });
  }

  private onCollage(event, collage: SafeResourceUrl) {
    console.log("Got new collage to show");
    this.renderer.setStyle(this.photoChild.nativeElement, 'background', `url(${collage}) center center no-repeat`);
  }
}
