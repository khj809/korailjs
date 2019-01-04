import dayjs from 'dayjs';
import axios from 'axios';
import qs from 'querystring';
import tough from 'tough-cookie';
import axiosCookieJarSupport from '@3846masa/axios-cookiejar-support';

import {
	Train,
	Ticket,
	Reservation,
	AdultPassenger, ChildPassenger, SeniorPassenger
} from './resources';
import {
	TrainTypes,
	ReserveOptions
} from './enums';
import {
	reducePassengers
} from './helpers';
import {
	KorailError, 
	NeedToLoginError, 
	NoResultsError, 
	SoldOutError
} from './errors';
import {
	DEFAULT_USER_AGENT, 
	EMAIL_REGEX, 
	PHONE_NUMBER_REGEX, 
	KORAIL_LOGIN, 
	KORAIL_SEARCH_SCHEDULE, 
	KORAIL_MYTICKETLIST, 
	KORAIL_MYRESERVATIONLIST, 
	KORAIL_TICKETRESERVATION, 
	KORAIL_CANCELRESERVATION
} from './constants';


axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();
axios.defaults.jar = cookieJar;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['User-Agent'] = DEFAULT_USER_AGENT;


class Korail {
	constructor(doFeedback=false){
		this._device = 'AD';
		this._version = '150718001';
		this._key = 'korail01234567890';

		this.membership_number = null;
		this.name = null;
		this.email = null;

		this.doFeedback = doFeedback;
		this.logined = false;
	}

	_resultCheck = (data) => {
		if (this.doFeedback){
			console.log(data.h_msg_txt);
		}

		if (data.strResult === 'FAIL'){
			const matchedError = [NeedToLoginError, NoResultsError, SoldOutError].filter(err => {
				return err.codes.includes(data.h_msg_cd);
			});

			if (matchedError.length > 0){
				throw new matchedError[0](data.h_msg_cd);
			} else {
				throw new KorailError(data.h_msg_txt, data.h_msg_cd);
			}
		}

		return true;
	}

	login = (
		korailId, 
		korailPw
	) => {
		let txtInputFlg = null;
		if (korailId.match(EMAIL_REGEX)) txtInputFlg = '5';
		else if (korailId.match(PHONE_NUMBER_REGEX)) txtInputFlg = '4';
		else txtInputFlg = '2';

		const payload = qs.stringify({
			Device: this._device,
			Version: this._version,
			txtInputFlg,
			txtMemberNo: korailId,
			txtPwd: korailPw
		});

		return new Promise(async (resolve, reject) => {
			try {
				const resp = await axios.post(KORAIL_LOGIN, payload);
				const data = resp.data;

				if (data.strResult === 'SUCC' && !!data.strMbCrdNo){
					this._key = data.Key;
					this.membership_number = data.strMbCrdNo;
					this.name = data.strCustNm;
					this.email = data.strEmailAdr;
					this.logined = true;
				} else {
					this.logined = false;
				}
				resolve(this.logined);
			}
			catch(e){
				reject(e);
			}
		});
	}

	searchTrain = (
		dep, 
		arr, 
		{
			date=null,
			time=null, 
			trainType=TrainTypes.ALL, 
			passengers=null, 
			includeNoSeats=false
		}={}
	) => {
		if (!date) date = dayjs().format('YYYYMMDD');
		if (!time) time = dayjs().format('HHmmss');
		if (!trainType) trainType = TrainTypes.ALL;
		
		if (!passengers || passengers.length === 0){
			passengers = [new AdultPassenger()];
		}

		passengers = reducePassengers(passengers);
		const adultCount = passengers.filter(psgr => psgr instanceof AdultPassenger).reduce((acc, psgr)=>acc + psgr.count, 0);
		const childCount = passengers.filter(psgr => psgr instanceof ChildPassenger).reduce((acc, psgr)=>acc + psgr.count, 0);
		const seniorCount = passengers.filter(psgr => psgr instanceof SeniorPassenger).reduce((acc, psgr)=>acc + psgr.count, 0);

		const params = {
			'Device': 'AD',
			'Version': '150718001',
			'radJobId': '1',
			'selGoTrain': trainType,
			'txtCardPsgCnt': '0',
			'txtGdNo': '',
			'txtGoAbrdDt': date,
			'txtGoEnd': arr,
			'txtGoHour': time,
			'txtGoStart': dep,
			'txtJobDv': '',
			'txtMenuId': '11',
			'txtPsgFlg_1': adultCount,
			'txtPsgFlg_2': childCount,
			'txtPsgFlg_3': seniorCount,
			'txtPsgFlg_4': '0',
			'txtPsgFlg_5': '0',
			'txtSeatAttCd_2': '000',
			'txtSeatAttCd_3': '000',
			'txtSeatAttCd_4': '015',
			'txtTrnGpCd': trainType,
		};

		return new Promise(async (resolve, reject) => {
			try {
				const resp = await axios.get(KORAIL_SEARCH_SCHEDULE, {params});
				const data = resp.data;
				this._resultCheck(data);

				const trainInfos = data.trn_infos.trn_info;
				let trains = trainInfos.map(ti => new Train(ti));
	
				if (!includeNoSeats){
					trains = trains.filter(t => t.hasSeat());
				}
	
				resolve(trains);
			} 
			catch(e) {
				reject(e);
			}
		});
	}

	reserve = (
		train, 
		{
			passengers=null, 
			reserveOption=ReserveOptions.GENERAL_FIRST
		}={}
	) => {
		let seatType = null;
		if (!train.hasSeat()) throw new SoldOutError();
		else if (reserveOption === ReserveOptions.GENERAL_ONLY){
			if (train.hasGeneralSeat()) seatType = '1';
			else throw new SoldOutError();
		}
		else if (reserveOption === ReserveOptions.SPECIAL_ONLY){
			if (train.hasSpecialSeat()) seatType = '2';
			else throw new SoldOutError();
		}
		else if (reserveOption === ReserveOptions.GENERAL_FIRST){
			if (train.hasGeneralSeat()) seatType = '1';
			else seatType = '2';
		}
		else if (reserveOption === ReserveOptions.SPECIAL_FIRST){
			if (train.hasSpecialSeat()) seatType = '2';
			else seatType = '1';
		}

		if (!passengers || passengers.length === 0){
			passengers = [new AdultPassenger()];
		}

		passengers = reducePassengers(passengers);
		const psgrCnt = passengers.reduce(function(acc, psgr){
			return acc + psgr.count;
		}, 0);
		
		const params = {
			Device: this._device,
			Version: this._version,
			Key: this._key,
			txtGdNo: '',
			txtJobId: '1101',
			txtTotPsgCnt: psgrCnt,
			txtSeatAttCd1: '000',
			txtSeatAttCd2: '000',
			txtSeatAttCd3: '000',
			txtSeatAttCd4: '015',
			txtSeatAttCd5: '000',
			hidFreeFlg: 'N',
			txtStndFlg: 'N',
			txtMenuId: '11',
			txtSrcarCnt: '0',
			txtJrnyCnt: '1',

			// 여정정보
			txtJrnySqno1: '001',
			txtJrnyTpCd1: '11',
			txtDptDt1: train.depDate,
			txtDptRsStnCd1: train.depCode,
			txtDptTm1: train.depTime,
			txtArvRsStnCd1: train.arrCode,
			txtTrnNo1: train.trainNo,
			txtRunDt1: train.runDate,
			txtTrnClsfCd1: train.trainType,
			txtPsrmClCd1: seatType,
			txtTrnGpCd1: train.trainGroup,
			txtChgFlg1: '',

			// txtTotPsgCnt 만큼 반복
			// txtPsgTpCd1		: '1',		// 손님 종류 (어른, 어린이)
			// txtDiscKndCd1	: '000',	// 할인 타입 (경로, 동반유아, 군장병 등..)
			// txtCompaCnt1		: '1',		// 인원수
			// txtCardCode_1	: '',
			// txtCardNo_1		: '',
			// txtCardPw_1		: '',
		}

		passengers.forEach((psgr, idx)=>{
			Object.assign(params, psgr.getDict(idx+1));
		});

		return new Promise(async (resolve, reject) => {
			try {
				const resp = await axios.get(KORAIL_TICKETRESERVATION, {params});
				const data = resp.data;
				this._resultCheck(data);

				let rsvList = await this.myReservations();
				rsvList = rsvList.filter(rsv => rsv.rsvId === data.h_pnr_no);
				
				resolve(rsvList[0]);
			} 
			catch(e){
				reject(e);
			}
		});
	}

	myTickets = () => {
		const params = {
			Device: this._device,
			Version: this._version,
			Key: this._key,
			txtIndex: '1',
			h_page_no: '1',
			txtDeviceId: '',
			h_abrd_dt_from: '',
			h_abrd_dt_to: '',
		}

		return new Promise(async (resolve, reject) => {
			try {
				const resp = await axios.get(KORAIL_MYTICKETLIST, {params});
				const data = resp.data;
				this._resultCheck(data);

				const ticket_infos = data.reservation_list;
				const tickets = ticket_infos.map(info => new Ticket(info));

				resolve(tickets);
			} 
			catch(e){
				reject(e);
			}
		});
	}

	myReservations = () => {
		const params = {
			Device: this._device,
			Version: this._version,
			Key: this._key,
		};

		return new Promise(async (resolve, reject) => {
			try {
				const resp = await axios.get(KORAIL_MYRESERVATIONLIST, {params});
				const data = resp.data;
				this._resultCheck(data);

				const rsvInfos = data.jrny_infos.jrny_info;
				const reserves = [];
				rsvInfos.forEach(info => {
					info.train_infos.train_info.forEach(tinfo => {
						reserves.push(new Reservation(tinfo));
					});
				});

				resolve(reserves);
			}
			catch(e) { 
				reject(e);
			}
		});
	}

	cancelReservation = (rsv) => {
		const params = {
			Device: this._device,
			Version: this._version,
			Key: this._key,
			txtPnrNo: rsv.rsvId,
			txtJrnySqno: rsv.journeyNo,
			txtJrnyCnt: rsv.journeyCnt,
			hidRsvChgNo: rsv.rsvChgNo,
		};

		return new Promise(async (resolve, reject) => {
			try {
				const resp = await axios.get(KORAIL_CANCELRESERVATION, {params});
				const data = resp.data;
				this._resultCheck(data);
				resolve();
			}
			catch(e) {
				reject(e);
			}
		});
	}
}

module.exports = Korail;
