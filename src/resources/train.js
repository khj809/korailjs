class Schedule{
	constructor(data){
		this.trainType = data.h_trn_clsf_cd;
		this.trainTypeName = data.h_trn_clsf_nm;
		this.trainGroup = data.h_trn_gp_cd;
		this.trainNo = data.h_trn_no;
		this.delayTime = data.h_expct_dlay_hr;

		this.depName = data.h_dpt_rs_stn_nm;
		this.depCode = data.h_dpt_rs_stn_cd;
		this.depDate = data.h_dpt_dt;
		this.depTime = data.h_dpt_tm;

		this.arrName = data.h_arv_rs_stn_nm;
		this.arrCode = data.h_arv_rs_stn_cd;
		this.arrDate = data.h_arv_dt;
		this.arrTime = data.h_arv_tm;

		this.runDate = data.h_run_dt;
	}

	toString(){
		const depTime = `${this.depTime.substr(0,2)}:${this.depTime.substr(2,2)}`;
		const arrTime = `${this.arrTime.substr(0,2)}:${this.arrTime.substr(2,2)}`;
		const depDate = `${this.depDate.substr(4,2)}월 ${this.depDate.substr(6)}일`;

		const repr_str = `[${this.trainTypeName}] ${depDate}, ${this.depName}~${this.arrName}(${depTime}~${arrTime})`;
		return repr_str;
	}
}

class Train extends Schedule{
	constructor(data){
		super(data);
		this.reservePossible = data.h_rsv_psb_flg;
		this.reservePossibleName = data.h_rsv_psb_nm;
		this.specialSeat = data.h_spe_rsv_cd;
		this.generalSeat = data.h_gen_rsv_cd;
	}

	toString(){
		let repr_str = super.toString();
		if (!!this.reservePossibleName){
			const seats = [];
			if (this.hasSpecialSeat()){
				seats.push('특실');
			}
			if (this.hasGeneralSeat()){
				seats.push('일반실');
			}
			repr_str += ` ${seats.join(',')} ${this.reservePossibleName.replace('\n', ' ')}`;
		}
		return repr_str;
	}

	hasSpecialSeat = () => {
		return this.specialSeat === '11';
	}

	hasGeneralSeat = () => {
		return this.generalSeat === '11';
	}

	hasSeat = () => {
		return this.hasGeneralSeat() || this.hasSpecialSeat();
	}
}

export default Train;
