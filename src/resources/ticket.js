import Train from './train';

class Ticket extends Train{
    constructor(data){
        const rawData = data.ticket_list[0].train_info[0];
        super(rawData);

        this.seatNoEnd = rawData.h_seat_no_end;
        this.seatNoCount = rawData.h_seat_cnt;

        this.buyerName = rawData.h_buy_ps_nm;
        this.saleDate = rawData.h_orgtk_sale_dt;
        this.saleInfo1 = rawData.h_orgtk_wct_no;
        this.saleInfo2 = rawData.h_orgtk_ret_sale_dt;
        this.saleInfo3 = rawData.h_orgtk_sale_sqno;
        this.saleInfo4 = rawData.h_orgtk_ret_pwd;
        this.price = rawData.h_rcvd_amt;

        this.carNo = rawData.h_srcar_no;
        this.seatNo = rawData.h_seat_no;
    }

    toString(){
        let repr_str = super.toString();

        repr_str += ` => ${this.carNo}호`

        if (Number(this.seatNoCount) !== 1){
            repr_str += ` ${this.seatNo}~${this.seatNoEnd}`;
        } else {
            repr_str += ` ${this.seatNo}`;
        }

        repr_str += `, ${this.price}원`;

        return repr_str;
    }

    getTicketNo(){
        return [this.saleInfo1, this.saleInfo2, this.saleInfo3, this.saleInfo4].join('-');
    }
}

export default Ticket;
