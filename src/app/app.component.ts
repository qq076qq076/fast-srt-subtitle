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
  private KeyCodeStartLine = 'KeyK';
  private KeyCodeEndLine = 'KeyL';
  private KeyCodeSeekForward = 'KeyU';
  private KeyCodeSeekBackward = 'KeyP';
  private KeyCodeGoNextSrt = 'KeyO';
  private KeyCodeGoLastSrt = 'KeyI';
  private KeyCodeDownloadSrt = 'KeyQ';

  private SecondsToSeek = 3;
  private SrtToGo = 1;

  @ViewChild('youtube') youtube: YouTubePlayer;
  @ViewChild('mp4Player') mp4PlayerRef: ElementRef;

  videoType = 'youtube';
  subtitle = '';
  srtList: Srt[] = [];
  youtubeUrl: string;
  video;
  mp4Src: SafeUrl;
  videoId: string;

  private storageKey = 'subTitle';

  private lineCursor = -1;

  get mp4Player(): HTMLVideoElement {
    return this.mp4PlayerRef.nativeElement;
  }

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
    if (event.code === this.KeyCodeStartLine) {
      this.handleStartLine();
    } else if (event.code === this.KeyCodeEndLine) {
      this.handleEndLine();
    } else if (event.code === this.KeyCodeGoLastSrt) {
      this.handleGoLastSrt();
    } else if (event.code === this.KeyCodeGoNextSrt) {
      this.handleGoNextSrt();
    } else if (event.code === this.KeyCodeSeekForward) {
      this.handleSeekForward();
    } else if (event.code === this.KeyCodeSeekBackward) {
      this.handleSeekBackward();
    } else if (event.code === this.KeyCodeDownloadSrt) {
      this.handleDownloadSrt();
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

  loadFromYoutube() {
    this.videoId = this.youtubeUrl.split('v=')[1];
    const ampersandPosition = this.videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      this.videoId = this.videoId.substring(0, ampersandPosition);
    }
  }

  loadFromMp4File(event: Event) {
    const blob = URL.createObjectURL((event.target as HTMLInputElement).files[0]);
    this.mp4Src = this.sanitizer.bypassSecurityTrustUrl(blob);
  }

  saveText() {
    this.storageService.set(this.storageKey, this.subtitle);
  }

  clickMp4Player(event) {
    if (this.mp4Player.paused) {
      this.mp4Player.play();
    } else {
      this.mp4Player.pause();
    }
  }

  private getTrackCurrentTime(): number {
    return this.mp4Player.currentTime;
  }

  private seekTrack(seconds) {
    this.mp4Player.currentTime += seconds;
  }

  private startToMakeSrt() {
    this.lineCursor = -1;
  }

  private setupSrtList() {
    this.srtList = this.subtitle.split(/[\n]/).map(content => new Srt(content.trim()));
  }

  private handleStartLine() {
    console.log(this.mp4Player.currentTime);
    if (this.lineCursor >= 0 && this.srtList[this.lineCursor].endTime ==  null) {
      this.srtList[this.lineCursor].endTime = this.getTrackCurrentTime();
    }

    this.lineCursor++;
    if (this.srtList.length <= this.lineCursor) {
      return;
    }

    this.srtList[this.lineCursor].startTime = this.getTrackCurrentTime();
  }

  private handleEndLine() {
    this.srtList[this.lineCursor].endTime = this.getTrackCurrentTime();
  }

  private handleSeekForward() {
    this.seekTrack(this.SecondsToSeek);
  }

  private handleSeekBackward() {
    this.seekTrack(-this.SecondsToSeek);

    const currentTime = this.getTrackCurrentTime();
    let i = this.lineCursor;
    for (; i > -1; i--) {
      const srt = this.srtList[i];
      if (srt.endTime === undefined || srt.endTime > currentTime) {
        srt.endTime = null;

        if (srt.startTime === undefined || srt.startTime > currentTime) {
          srt.startTime = null;
          continue;
        }
      }
      break;
    }

    this.lineCursor = i;
  }

  private handleGoNextSrt() {
    if (this.lineCursor < this.srtList.length) {
      this.lineCursor++;
    }
  }

  private handleGoLastSrt() {
    if (this.lineCursor > -1) {
      this.lineCursor--;
    }
  }

  private handleDownloadSrt() {

  }
}
