/* eslint-disable import/no-cycle */
/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 *
 * ONLY PUT COMMONLY USED TYPES HERE
 */

import { Moment } from 'moment';
import { FilterOptions } from './ResultsPage/filters';
import { CompositeReq, ReqFor } from '../../common/types';

type TimeTuple = {
  start : number;
  end : number;
}

export type MomentTuple = {
  start : Moment,
  end : Moment
}

type TimeToMoment = {
  [key: number] : MomentTuple[];
}

export interface Course {
  sections: Section[];
  prereqs : CompositeReq;
  coreqs : CompositeReq;
  host: string;
  termId: string;
  desc : string;
  name : string;
  prettyUrl : string;
  classId : string;
  subject : string;
  lastUpdateTime : number;
  prereqsFor : ReqFor;
  optPrereqsFor : ReqFor;
  minCredits: number;
  maxCredits: number;
  feeDescription: string;
  feeAmount: number;
  nupath: any;
}

interface Section {
  lastUpdateTime : number;
  meetings: Meeting[];
  profs : string[];
  waitCapacity : number;
  waitRemaining : number;
  online : boolean;
  seatsRemaining: number;
  seatsCapacity : number;
  honors : boolean;
  crn: string;
  campus: string;
  campusDescription: string;
  url: string;
}

interface Meeting {
  location: string;
  startDate: Moment;
  endDate: Moment;
  times: MomentTuple[];
}

// ======= Search Results ========
// Represents the course and employee data returned by /search
export interface SearchResult {
  results: SearchItem[],
  filterOptions: FilterOptions,
}

export type CourseResult = {
  class: Course,
  sections: Section[]
  type: string
}
export type Employee = any;
export type SearchItem = CourseResult | Employee;

export function NO_SEARCH_RESULTS(): SearchResult {
  return {
    results: [],
    filterOptions: {
      nupath: [],
      subject: [],
      classType: [],
      campus: [],
    },
  }
}

export enum DayOfWeek {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
}
