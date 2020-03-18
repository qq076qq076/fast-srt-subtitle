import {Srt} from '../models/Srt';
import {Time} from '../models/Time';

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

  private convert(time: Time): string {
    if (time.time === undefined) {
      return 'undefined';
    }

    return ('00' + time.hours).slice(-2)
      + ':' + ('00' + time.minutes).slice(-2)
      + ':' + ('00' + time.seconds).slice(-2)
      + ',' + time.milliseconds;
  }
}
