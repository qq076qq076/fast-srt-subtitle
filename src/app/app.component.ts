import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { StorageService } from './service/storage/storage.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { YouTubePlayer } from '@angular/youtube-player';

interface Srt {
  startTime: string;
  endTime: string;
  content: string;
}

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
  ) { }

  @HostListener('window:keyup', ['$event']) keyEvent(event: KeyboardEvent) {
    console.log(event);
    if (event.code === 'keyK') {
      // 下一行開始
    } else if (event.code === 'keyL') {
      // 這一行提前結束
    } else if (event.code === 'keyI') {
      // 前捲一行
    } else if (event.code === 'keyO') {
      // 後捲一行
    } else if (event.code === 'keyU') {
      // 倒帶 3 秒
    } else if (event.code === 'keyP') {
      // 前進 3 秒
    } else if (event.code === 'keyQ') {
      // 製作 SRT 檔
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
        this.setSrtText();
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

  toggleMP4Pplayer(event) {
    if (this.mp4Player.paused) {
      this.mp4Player.play();
    } else {
      this.mp4Player.pause();
    }
  }

  private setSrtText() {
    this.srtList = this.subtitle.split(/[\n]/).map(content => ({
      startTime: '',
      endTime: '',
      content: content.trim(),
    }));
    console.log(this.subtitle);
    console.log(this.srtText);
  }
}
