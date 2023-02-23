export enum DateModifiedType {
  None = '-',
  Today = 'Today',
  Yesterday = 'Yesterday',
  ThisWeek = 'This week',
  LastWeek = 'Last week',
  ThisMonth = 'This month',
  LastMonth = 'Last month',
  ThisYear = 'This year',
  LastYear = 'Last year',
}
const DAY1 = 1000 * 60 * 60 * 24;
const cutoffHours = (dt: Date): Date => {
  const r = new Date();
  r.setTime(dt.getTime());
  r.setHours(0);
  r.setMinutes(0);
  r.setSeconds(0);
  r.setMilliseconds(0);
  return r;
};
export namespace DateModifiedType {
  export function isValid(
    type: DateModifiedType,
    inDate: number | Date,
  ): boolean {
    const now = new Date();
    const today = cutoffHours(now).getTime();
    if (typeof inDate === 'number') {
      inDate = new Date(inDate);
    }
    switch (type) {
      case DateModifiedType.Today:
        return today <= inDate.getTime() && inDate.getTime() <= today + DAY1;
      case DateModifiedType.Yesterday:
        return today - DAY1 <= inDate.getTime() && inDate.getTime() <= today;
      case DateModifiedType.ThisWeek: {
        const d = new Date();
        d.setTime(
          d.getTime() - (d.getDay() ? d.getDay() : 7) * 24 * 60 * 60 * 1000,
        );
        const endOfWeek = cutoffHours(d).getTime();
        d.setTime(d.getTime() - 6 * 24 * 60 * 60 * 1000);
        const startOfWeek = cutoffHours(d).getTime();
        return (
          endOfWeek <= inDate.getTime() &&
          inDate.getTime() <= startOfWeek + DAY1
        );
      }
      case DateModifiedType.LastWeek: {
        const d = new Date();
        d.setTime(
          d.getTime() -
            (d.getDay() ? d.getDay() : 7) * 24 * 60 * 60 * 1000 -
            DAY1 * 7,
        );
        const endOfWeek = cutoffHours(d).getTime();
        d.setTime(d.getTime() - 6 * 24 * 60 * 60 * 1000);
        const startOfWeek = cutoffHours(d).getTime();
        return (
          endOfWeek <= inDate.getTime() &&
          inDate.getTime() <= startOfWeek + DAY1
        );
      }
      case DateModifiedType.ThisMonth:
        return (
          now.getFullYear() === inDate.getFullYear() &&
          now.getMonth() === inDate.getMonth()
        );
      case DateModifiedType.ThisYear:
        return now.getFullYear() === inDate.getFullYear();
    }
    return true;
  }
}
