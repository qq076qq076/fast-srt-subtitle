export class Srt {
  startTime?: number;
  endTime?: number;
  content: string;

  constructor(content: string, startTime?: number, endTime?: number) {
    this.content = content;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  get startTimeText(): string {
    return !!this.startTime ? this.generateTimeString(this.startTime) : '';
  }

  get endTimeText(): string {
    return !!this.endTime ? this.generateTimeString(this.endTime) : '';
  }

  private generateTimeString(seconds: number): string {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor(seconds / 60 % 60);
    const sec = Math.floor(seconds % 60);
    const milli = Math.floor(((seconds % 60) - sec) * 1000);
    return ('00' + hours).slice(-2) + ':' + ('00' + minutes).slice(-2) + ':' + ('00' + sec).slice(-2) + ',' + milli;
  }
}
