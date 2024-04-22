import Dayjs from 'dayjs/esm';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

export function inTwoDate(begin, end) {
    const strNow = new Date().toISOString().substring(0, 10);
    const target = Dayjs(strNow);
    Dayjs.extend(isSameOrBefore);
    Dayjs.extend(isSameOrAfter);
    const isStart = target.isSameOrAfter(Dayjs(begin));
    const isEnd = target.isSameOrBefore(Dayjs(end));
    console.log(isStart, isEnd, isStart && isEnd)
    return isStart && isEnd;
}