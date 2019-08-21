import Korail from "./korail";
import {
  Train,
  Ticket,
  Reservation,
  AdultPassenger,
  ChildPassenger,
  SeniorPassenger
} from "./resources";
import { TrainTypes, ReserveOptions } from "./enums";
import {
  KorailError,
  NeedToLoginError,
  NoResultsError,
  SoldOutError
} from "./errors";

export {
  Train,
  Ticket,
  Reservation,
  AdultPassenger,
  ChildPassenger,
  SeniorPassenger,
  TrainTypes,
  ReserveOptions,
  KorailError,
  NeedToLoginError,
  NoResultsError,
  SoldOutError
};
export default Korail;
