import {Srt} from '../models/Srt';

export class YoutubeSrtGenerator {
  private srtList: Srt[];

  constructor(srtList: Srt[]) {
    this.srtList = srtList;
  }

  get fileExtension(): string {
    return 'srt';
  }

  generate(): string {
    const lineList = this.srtList.reduce((list: string[], srt: Srt, index: number) => {
      list.push((index + 1).toString());
      list.push(this.convert(srt.startTime) + ' ---> ' + this.convert(srt.endTime));
      list.push(srt.content);
      list.push('\n');
      return list;
    }, []);

    return lineList.join('\n');
  }

  private convert(seconds?: number): string {
    if (seconds === undefined) {
      return 'undefined';
    }

    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor(seconds / 60 % 60);
    const sec = Math.floor(seconds % 60);
    const milli = Math.floor(((seconds % 60) - sec) * 1000);
    return ('00' + hours).slice(-2) + ':' + ('00' + minutes).slice(-2) + ':' + ('00' + sec).slice(-2) + ',' + milli;
  }
}
