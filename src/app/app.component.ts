import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {StorageService} from './service/storage/storage.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {YouTubePlayer} from '@angular/youtube-player';
import {Srt} from './models/Srt';
import {SourceType} from './models/SourceType';
import * as FileSaver from 'file-saver';
import {YoutubeSrtGenerator} from './generators/YoutubeSrtGenerator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private KeyCodeStartLine = 'KeyK';
  private KeyCodeEndLine = 'KeyL';
  private KeyCodeSeekForward = 'KeyP';
  private KeyCodeSeekBackward = 'KeyU';
  private KeyCodeGoNextSrt = 'KeyO';
  private KeyCodeGoLastSrt = 'KeyI';
  private KeyCodeDownloadSrt = 'KeyQ';

  private SecondsToSeek = 3;
  private Filename = 'result';

  @ViewChild('youtube') youtube: YouTubePlayer;
  @ViewChild('mp4Player') mp4PlayerRef: ElementRef;

  subtitle = '';
  srtList: Srt[] = [];

  readonly SourceTypeEnum = SourceType;
  sourceType: SourceType = this.SourceTypeEnum.Youtube;

  youtubeUrl: string;
  youtubeVideoId: string;

  mp4File;
  mp4FileSafeUrl: SafeUrl;

  private lineCursor = -1;

  get mp4Player(): HTMLVideoElement {
    return this.mp4PlayerRef.nativeElement;
  }

  get srtText(): string {
    return this.srtList.map((srt, index) => {
      return index + '\n'
        + srt.startTime + ' --> ' + srt.endTime + '\n'
        + srt.content + '\n\n';
    }).join('');
  }

  constructor(
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
  ) {
  }

  @HostListener('window:keyup', ['$event']) keyEvent(event: KeyboardEvent) {
    this.keyupListener(event);
  }

  setListener(event: YT.PlayerEvent) {
    // event.target.addEventListener('keyup', this.keyupListener.bind(this));
  }

  ngOnInit(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    this.youtubeVideoId = 'Ath3BX9DBRs';
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
    this.youtubeVideoId = this.youtubeUrl.split('v=')[1];
    const ampersandPosition = this.youtubeVideoId.indexOf('&');
    if (ampersandPosition !== -1) {
      this.youtubeVideoId = this.youtubeVideoId.substring(0, ampersandPosition);
    }
  }

  loadFromMp4File(event: Event) {
    const blob = URL.createObjectURL((event.target as HTMLInputElement).files[0]);
    this.mp4FileSafeUrl = this.sanitizer.bypassSecurityTrustUrl(blob);
  }

  clickMp4Player(event) {
    if (this.mp4Player.paused) {
      this.mp4Player.play();
    } else {
      this.mp4Player.pause();
    }
  }

  keyupListener(event: KeyboardEvent) {
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

  private getTrackCurrentTime(): number {
    if (this.sourceType === this.SourceTypeEnum.LocalFile) {
      return this.mp4Player.currentTime;
    } else if (this.sourceType === this.SourceTypeEnum.Youtube) {
      return this.youtube.getCurrentTime();
    }
  }

  private seekTrack(seconds) {
    if (this.sourceType === this.SourceTypeEnum.LocalFile) {
      this.mp4Player.currentTime += seconds;
    } else if (this.sourceType === this.SourceTypeEnum.Youtube) {
      return this.youtube.seekTo(this.youtube.getCurrentTime() + seconds, false);
    }
  }

  private startToMakeSrt() {
    this.lineCursor = -1;
  }

  private setupSrtList() {
    this.srtList = this.subtitle.split(/[\n]/).map(content => ({
      content: content.trim(),
    }));
  }

  private handleStartLine() {
    if (this.lineCursor >= 0 && this.srtList[this.lineCursor].endTime === undefined) {
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
        srt.endTime = undefined;

        if (srt.startTime === undefined || srt.startTime > currentTime) {
          srt.startTime = undefined;
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
    const srtGenerator = new YoutubeSrtGenerator(this.srtList);
    const srt = srtGenerator.generate();
    const filename = this.Filename + '.' + srtGenerator.fileExtension;
    const file = new File([srt], filename, {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(file);
  }
}
