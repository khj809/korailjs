import Train from './train';
import {getParsedDate} from '../helpers';

class Reservation extends Train{
    init(data){
        super.init(data);
        this.depDate = data.h_run_dt;
        this.arrDate = data.h_run_dt;

        this.rsvId = data.h_pnr_no;
        this.seatNoCount = Number(data.h_tot_seat_cnt);
        this.buyLimitDate = data.h_ntisu_lmt_dt;
        this.buyLimitTime = data.h_ntisu_lmt_tm;
        this.price = data.h_rsv_amt;
        this.journeyNo = data.txtJrnySqno || '001';
        this.journeyCnt = data.txtJrnyCnt || '01';
        this.rsvChgNo = data.hidRsvChgNo || '00000';

        this.isWaiting = this.buyLimitDate === '00000000';
    }

    get buyLimit(){
        if (!this.isWaiting){
            return new Date(...getParsedDate(`${this.buyLimitDate.substr(0, 4)}-${this.buyLimitDate.substr(4, 2)}-${this.buyLimitDate.substr(6, 2)} ` + 
            `${this.buyLimitTime.substr(0, 2)}:${this.buyLimitTime.substr(2, 2)}:${this.buyLimitTime.substr(4, 2)}`));
        } else {
            return null;
        }
    }

    toString(){
        let repr_str = super.toString();
        repr_str += `, ${this.price}원(${this.seatNoCount}석)`;
        
        const buyLimitTime = `${this.buyLimitTime.substr(0, 2)}:${this.buyLimitTime.substr(2, 2)}`;
        const buyLimitDate = `${this.buyLimitDate.substr(4, 2)}월 ${this.buyLimitDate.substr(6)}일`;

        repr_str += `, 구입기한 ${buyLimitDate} ${buyLimitTime}`;
        return repr_str;
    }
}

export default Reservation;
