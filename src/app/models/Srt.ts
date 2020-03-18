import {Time} from './Time';

export class Srt {
  startTime: Time;
  endTime: Time;
  content: string;

  constructor(content: string, startTime?: number, endTime?: number) {
    this.content = content;
    this.startTime = new Time(startTime);
    this.endTime = new Time(endTime);
  }
}
