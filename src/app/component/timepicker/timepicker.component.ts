import { Component, OnInit, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Time } from 'src/app/models/Time';
import { TimeUtil } from 'src/app/utils/TimeUtil';

export const INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TimepickerComponent),
  multi: true
};

export interface TimeInput extends NgbTimeStruct {
  millisecond: number;
}

@Component({
  selector: 'app-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss'],
  providers: [INPUT_CONTROL_VALUE_ACCESSOR],
})
export class TimepickerComponent implements OnInit, ControlValueAccessor {

  constructor() { }
  onChange: (time: Time) => void;
  onTouch: () => void;
  isDisabled: boolean;
  time: NgbTimeStruct;
  millisecond: number;

  ngOnInit(): void {
  }

  changeTime() {
    if (this.onChange) {
      let time = 0;
      time += this.time.hour * 3600;
      time += this.time.minute * 60;
      time += this.time.second;
      time += parseInt((this.millisecond + '000').slice(0, 3), 10) / 1000;
      const date: Time = new Time(time);
      this.onChange(date);
    }
  }

  writeValue(value: number): void {
    if (value) {
      this.time = {
        hour: +TimeUtil.hours(value),
        minute: +TimeUtil.minutes(value),
        second: +TimeUtil.seconds(value),
      };
      this.millisecond = +TimeUtil.milliseconds(value);
    } else {
      this.time = {
        hour: 0,
        minute: 0,
        second: 0,
      };
      this.millisecond = 0;
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

}
