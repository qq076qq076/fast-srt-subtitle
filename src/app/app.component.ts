import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { StorageService } from './service/storage/storage.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('youtube') youtube;
  @ViewChild('mp4Player') mp4PlayerRef: ElementRef;
  get mp4Player(): HTMLVideoElement {
    return this.mp4PlayerRef.nativeElement;
  }

  videoType = 'youtube';
  subtitle = '';
  youtubeUrl: string;
  video;
  mp4Src: SafeUrl;
  videoId: string;
  private storageKey = 'subTitle';
  constructor(
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
  ) { }

  @HostListener('window:keyup', ['$event']) keyEvent(event: KeyboardEvent) {
    console.log(event);
    if (event.code === 'keyK') {

    }
  }

  ngOnInit(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    this.videoId = 'Ath3BX9DBRs';
  }

  // Youtube
  setVideoId() {
    this.videoId = this.youtubeUrl.split('v=')[1];
    const ampersandPosition = this.videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      this.videoId = this.videoId.substring(0, ampersandPosition);
    }
  }

  saveText() {
    this.storageService.set(this.storageKey, this.subtitle);
  }

  stateChange(event) {
    const time = event.target.getCurrentTime();
  }

  // MP4
  previewMP4(event: Event) {
    const blob = URL.createObjectURL((event.target as HTMLInputElement).files[0]);
    this.mp4Src = this.sanitizer.bypassSecurityTrustUrl(blob);
    console.log(event);
  }

  toggleMP4Pplayer(event) {
    if (this.mp4Player.paused) {
      this.mp4Player.play();
    } else {
      this.mp4Player.pause();
    }
  }
}
