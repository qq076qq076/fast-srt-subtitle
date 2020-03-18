import {TimeUtil} from '../utils/TimeUtil';

export class Time {
  private timeSeconds?: number;
  private hour?: string;
  private minute?: string;
  private second?: string;
  private millisecond?: string;

  constructor(timeSeconds?: number) {
    this.timeSeconds = timeSeconds;
    if (timeSeconds !== undefined) {
      this.updateString();
    }
  }

  get time(): number {
    return this.timeSeconds;
  }

  set time(value: number) {
    this.timeSeconds = value;
    this.updateString();
  }

  get hours(): string {
    return this.hour ?? '';
  }

  set hours(value: string) {
    this.hour = value.length > 0 ? value : undefined;
    this.updateNumber();
  }

  get minutes(): string {
    return this.minute ?? '';
  }

  set minutes(value: string) {
    this.minute = value.length > 0 ? value : undefined;
    this.updateNumber();
  }

  get seconds(): string {
    return this.second ?? '';
  }

  set seconds(value: string) {
    this.second = value.length > 0 ? value : undefined;
    this.updateNumber();
  }

  get milliseconds(): string {
    return this.millisecond ?? '';
  }

  set milliseconds(value: string) {
    this.millisecond = value.length > 0 ? value : undefined;
    this.updateNumber();
  }

  private updateNumber() {
    if (this.hour === undefined || this.minute === undefined || this.second === undefined || this.millisecond === undefined) {
      this.timeSeconds = undefined;
    } else {
      let time = 0;
      time += parseInt(this.hour, 10) * 3600;
      time += parseInt(this.minute, 10) * 60;
      time += parseInt(this.second, 10);
      time += parseInt((this.millisecond + '000').slice(0, 3), 10) / 1000;
      this.timeSeconds = time;
    }
  }

  private updateString() {
    if (this.timeSeconds === undefined) {
      this.hour = undefined;
      this.millisecond = undefined;
      this.second = undefined;
      this.millisecond = undefined;
    } else {
      this.hour = TimeUtil.hours(this.timeSeconds);
      this.minute = TimeUtil.minutes(this.timeSeconds);
      this.second = TimeUtil.seconds(this.timeSeconds);
      this.millisecond = TimeUtil.milliseconds(this.timeSeconds);
    }
  }
}
