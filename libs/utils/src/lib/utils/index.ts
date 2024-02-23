import moment from 'moment';

export const convertTimeString = (date: string) =>  {
    const codeTime = moment(date);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');
    if (codeTime.isSame(today, 'd')) {
        // Date is today
        const formattedTime = codeTime.format('HH:mm');
        return `Today at ${formattedTime}`;
    } else if (codeTime.isSame(yesterday, 'd')) {
        // Date is yesterday
        const formattedTime = codeTime.format('HH:mm');
        return `Yesterday at ${formattedTime}`;
    } else {
        // Date is neither today nor yesterday
        const formattedDate = codeTime.format('DD/MM/YYYY, HH:mm');
        return formattedDate;
    }
}

export const convertTimeHour = (date: string) =>  {
    const codeTime = moment(date);
    const formattedTime = codeTime.format('HH:mm');
    return formattedTime;
}

export const convertDateString = (date: string) =>  {
    const codeTime = moment(date);
    const formattedDate = codeTime.format('ddd, DD MMMM YYYY');
    return formattedDate;
}

export const getTimeDifferenceInSeconds = (startTimeString:string, endTimeString:string) => {
    const startTime = moment(startTimeString);
    const endTime = moment(endTimeString);
    const timeDifferenceInSeconds = endTime.diff(startTime, 'seconds');
    return timeDifferenceInSeconds;
}

export const checkSameDay = (startTimeString: string, endTimeString: string) => {
    if(!startTimeString) return false
    const startTime = moment(startTimeString);
    const endTime = moment(endTimeString);
    const sameDay = startTime.isSame(endTime, 'day');
    return sameDay;
}

