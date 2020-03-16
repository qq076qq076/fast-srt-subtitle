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

  private generateTimeString(timestamp: number): string {
    const seconds = Math.floor(timestamp / 1000);
    const milliseconds = timestamp - seconds * 1000;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const sec = seconds % 60;
    const min = minutes % 60;

    return hours + ':' + min + ':' + sec + '.' + milliseconds;
  }
}
