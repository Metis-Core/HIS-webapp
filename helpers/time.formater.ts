import moment from 'moment';

export const formatDate = (date: string | Date, format = 'DD MMM YYYY') => moment(date).format(format);

export const formatDateTime = (date: string | Date) => moment(date).format('DD MMM YYYY, HH:mm');

export const fromNow = (date: string | Date) => moment(date).fromNow();
