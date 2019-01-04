function KorailError(msg, code){
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.msg = msg;
    this.code = code;
}

class NeedToLoginError extends KorailError{
    constructor(code=null){
        super("Need to Login", code);
    }
}
NeedToLoginError.codes = ['P058'];

class NoResultsError extends KorailError{
    constructor(code=null){
        super("No Results", code);
    }
}
NoResultsError.codes = [
    'P100', 
    'WRG000000', 
    'WRD000061',    // 직통열차는 없지만, 환승으로 조회 가능합니다.
    'WRT300005',
]

class SoldOutError extends KorailError{
    constructor(code=null){
        super("Sold Out", code);
    }
}
SoldOutError.codes = ['ERR211161'];

export {
    KorailError,
    NeedToLoginError,
    NoResultsError,
    SoldOutError,
}
