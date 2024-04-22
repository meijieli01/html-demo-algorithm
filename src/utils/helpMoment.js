import moment from 'moment';

export function inTwoDate(begin, end) {
    const strNow = new Date().toISOString().substring(0, 10);
    const target = moment(strNow);
    const isStart = target.isSameOrAfter(begin);
    const isEnd = target.isSameOrBefore(end);
    console.log(moment, isStart, isEnd, isStart && isEnd)
    return isStart && isEnd;
}