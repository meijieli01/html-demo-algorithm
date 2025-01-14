import { Observable, from, delay, take, filter, expand } from 'rxjs';

export const polling = (options) => {
    options = Object.assign(
        {
            maxTimes: 20,
            tick: 1000,
        },
        options,
    );
    let count = 0;
    const request$ = new Observable((subscriber)=>{
        if (count > options.maxTimes) {
            subscriber.error(new Error('max polling times'));
        } else {
            options
                .try(options.tryRequest)
                .then(res=>{
                    subscriber.next(res);
                    count++;
                }).catch(err=>{
                    subscriber.error(err);
                });
        }
    });
    return from(request$).pipe(
        expand(()=> request$.pipe(delay(options.tick))),
        filter(res=>{
            return options.retryUntil(res);
        }),
        take(1)
    );
}
