export const EMAIL_REGEX = /[^@]+@[^@]+\.[^@]+/;
export const PHONE_NUMBER_REGEX = /(\d{3})-(\d{3,4})-(\d{4})/;

const SCHEME = 'https';
const KORAIL_HOST = 'smart.letskorail.com';
const KORAIL_PORT = '443';

const KORAIL_DOMAIN = `${SCHEME}://${KORAIL_HOST}:${KORAIL_PORT}`;
const KORAIL_MOBILE = `${KORAIL_DOMAIN}/classes/com.korail.mobile`;

export const KORAIL_LOGIN = `${KORAIL_MOBILE}.login.Login`;
export const KORAIL_LOGOUT = `${KORAIL_MOBILE}.common.logout`;
export const KORAIL_SEARCH_SCHEDULE = `${KORAIL_MOBILE}.seatMovie.ScheduleView`;
export const KORAIL_TICKETRESERVATION = `${KORAIL_MOBILE}.certification.TicketReservation`;
export const KORAIL_REFUND = `${KORAIL_MOBILE}.refunds.RefundsRequest`;
export const KORAIL_MYTICKETLIST = `${KORAIL_MOBILE}.myTicket.MyTicketList`;
export const KORAIL_MYTICKET_SEAT = `${KORAIL_MOBILE}.refunds.SelTicketInfo`;

export const KORAIL_MYRESERVATIONLIST = `${KORAIL_MOBILE}.reservation.ReservationView`;
export const KORAIL_CANCELRESERVATION = `${KORAIL_MOBILE}.reservationCancel.ReservationCancelChk`;

export const KORAIL_STATION_DB = `${KORAIL_MOBILE}.common.stationinfo?device=ip`;
export const KORAIL_STATION_DB_DATA = `${KORAIL_MOBILE}.common.stationdata`;
export const KORAIL_EVENT = `${KORAIL_MOBILE}.common.event`;
export const KORAIL_PAYMENT = `${KORAIL_DOMAIN}/ebizmw/PrdPkgMainList.do`;
export const KORAIL_PAYMENT_VOUCHER = `${KORAIL_DOMAIN}/ebizmw/PrdPkgBoucherView.do`;

export const DEFAULT_USER_AGENT = 'Dalvik/2.1.0 (Linux; U; Android 5.1.1; Nexus 4 Build/LMY48T)';
