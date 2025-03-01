import { Moment } from "moment";

export interface DayDetail {
  day: number;
  by: number;
  blocks?: number;
  actualTime?: string;
  amount?: number;
  time: string;
  ignored: boolean;
}

export interface DayOffDetail {
  day: number;
  ignored: boolean;
}

export interface EmployeeSalary {
  name: string;
  halfDays: DayDetail[];
  lateDays: DayDetail[];
  earlyExitDays: DayDetail[];
  overTimeDays: DayDetail[];
  missedEntry: DayDetail[];
  longDays: DayDetail[];
  dayOff: DayOffDetail[];
  workdays: number;
  pay: number;
  ot: number;
  incentive: number;
}

export interface ReportInfo {
  month: string;
  year: string;
  days: number;
}

export interface AttendanceRecord {
  employee_name: string;
  date: string;
  in_time: string | Moment;
  out_time: string | Moment;
}

export interface StaffTiming {
  name: string;
  paidLeaves: number;
  incentive: number;
  schedule: Schedule[];
  salary: number;
}

export interface Schedule {
  actualStart: string | Moment;
  lateMark: string | Moment;
  halfDay: string | Moment;
  actualEnd: string | Moment;
  overTimeStart: string | Moment;
  date: string;
}
