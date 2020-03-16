import {Component, OnInit, ViewChild, HostListener, ElementRef} from '@angular/core';
import {StorageService} from './service/storage/storage.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {YouTubePlayer} from '@angular/youtube-player';
import {Srt} from './models/Srt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('youtube') youtube: YouTubePlayer;
  @ViewChild('mp4Player') mp4PlayerRef: ElementRef;

  get mp4Player(): HTMLVideoElement {
    return this.mp4PlayerRef.nativeElement;
  }

  videoType = 'youtube';
  subtitle = '';
  srtList: Srt[] = [];
  youtubeUrl: string;
  video;
  mp4Src: SafeUrl;
  videoId: string;

  private storageKey = 'subTitle';

  private beginningTimestamp = 0;
  private lineCursor = -1;

  get srtText(): string {
    return this.srtList.map((srt, index) => {
      return index + '\n'
        + srt.startTimeText + ' --> ' + srt.endTimeText + '\n'
        + srt.content + '\n\n';
    }).join('');
  }

  constructor(
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
  ) {
  }

  @HostListener('window:keyup', ['$event']) keyEvent(event: KeyboardEvent) {
    console.log(event);
    if (event.code === 'KeyK') {
      this.handleStartLine();
    } else if (event.code === 'KeyL') {
      this.handleEndLine();
    } else if (event.code === 'KeyI') {
      // TODO: 前捲一行
    } else if (event.code === 'KeyO') {
      // TODO: 後捲一行
    } else if (event.code === 'KeyU') {
      // TODO: 倒帶 3 秒
    } else if (event.code === 'KeyP') {
      // TODO: 前進 3 秒
    } else if (event.code === 'KeyQ') {
      // TODO: 製作 SRT 檔
    }
  }

  ngOnInit(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    this.videoId = 'Ath3BX9DBRs';
  }

  uploadText(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (fileList.length > 0) {
      const reader = new FileReader();
      reader.readAsText(fileList[0], 'UTF-8');
      reader.onload = (evt) => {
        this.subtitle = evt.target.result.toString();
        this.setupSrtList();
        this.startToMakeSrt();
      };
      reader.onerror = (evt) => {
        console.error('error reading file');
      };
    }
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
  }

  toggleMP4Player(event) {
    if (this.mp4Player.paused) {
      this.mp4Player.play();
    } else {
      this.mp4Player.pause();
    }
  }

  private startToMakeSrt() {
    this.lineCursor = -1;
    this.beginningTimestamp = Date.now();
  }

  private setupSrtList() {
    this.srtList = this.subtitle.split(/[\n]/).map(content => new Srt(content.trim()));
  }

  private generateTimestamp(): number {
    return Date.now() - this.beginningTimestamp;
  }

  private handleStartLine() {
    if (this.lineCursor >= 0 && this.srtList[this.lineCursor].endTime ==  null) {
      this.srtList[this.lineCursor].endTime = this.generateTimestamp();
    }

    this.lineCursor++;
    if (this.srtList.length <= this.lineCursor) {
      return;
    }

    this.srtList[this.lineCursor].startTime = this.generateTimestamp();
  }

  private handleEndLine() {
    this.srtList[this.lineCursor].endTime = this.generateTimestamp();
  }
}
