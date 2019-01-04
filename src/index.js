import '@babel/polyfill';
import Korail from './korail';
import {AdultPassenger, ChildPassenger, SeniorPassenger} from './resources';
import {TrainTypes, ReserveOptions} from './enums';

module.exports = {
	AdultPassenger, ChildPassenger, SeniorPassenger,
	TrainTypes, ReserveOptions
}
module.exports.default = Korail;
