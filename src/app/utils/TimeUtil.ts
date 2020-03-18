export class TimeUtil {
  static hours(seconds: number): string {
    const num = Math.floor(seconds / 60 / 60);
    return num.toString();
  }

  static minutes(seconds: number): string {
    const num = Math.floor(seconds / 60 % 60);
    return num.toString();
  }

  static seconds(seconds: number): string {
    const num = Math.floor(seconds % 60);
    return num.toString();
  }

  static milliseconds(seconds: number): string {
    const num = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return num.toString();
  }
}
