/**
 * Responsibility: Pure time progression and time-query utilities.
 * TODO: Add calendar/weekdays/seasons if simulation depth increases.
 */

import type { GameState, TimeState } from "../types";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface TimeRange {
  startHour: number;
  endHour: number;
}

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

function toAbsoluteMinutes(time: TimeState): number {
  return (time.day - 1) * MINUTES_PER_DAY + time.hour * MINUTES_PER_HOUR + time.minute;
}

function fromAbsoluteMinutes(totalMinutes: number): TimeState {
  const day = Math.floor(totalMinutes / MINUTES_PER_DAY) + 1;
  const minuteOfDay = totalMinutes % MINUTES_PER_DAY;
  const hour = Math.floor(minuteOfDay / MINUTES_PER_HOUR);
  const minute = minuteOfDay % MINUTES_PER_HOUR;
  return { day, hour, minute };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function getTimeOfDay(time: TimeState): TimeOfDay {
  if (time.hour >= 6 && time.hour < 12) return "morning";
  if (time.hour >= 12 && time.hour < 18) return "afternoon";
  if (time.hour >= 18 && time.hour < 22) return "evening";
  return "night";
}

export function advanceMinutes(time: TimeState, minutes: number): TimeState {
  if (!Number.isFinite(minutes)) {
    throw new Error("advanceMinutes expects a finite number");
  }
  const nextTotal = toAbsoluteMinutes(time) + Math.trunc(minutes);
  if (nextTotal < 0) {
    throw new Error("Time cannot move before day 1 00:00");
  }
  return fromAbsoluteMinutes(nextTotal);
}

export function advanceHours(time: TimeState, hours: number): TimeState {
  if (!Number.isFinite(hours)) {
    throw new Error("advanceHours expects a finite number");
  }
  return advanceMinutes(time, Math.trunc(hours * MINUTES_PER_HOUR));
}

export function getCurrentTimeLabel(time: TimeState): string {
  const timeOfDay = getTimeOfDay(time);
  return `Day ${time.day} ${pad2(time.hour)}:${pad2(time.minute)} (${timeOfDay})`;
}

export function isInTimeRange(time: TimeState, range: TimeRange): boolean {
  const hour = time.hour;
  if (range.startHour === range.endHour) {
    return true;
  }
  if (range.startHour < range.endHour) {
    return hour >= range.startHour && hour < range.endHour;
  }
  return hour >= range.startHour || hour < range.endHour;
}

export function advanceGameStateMinutes(state: GameState, minutes: number): GameState {
  return {
    ...state,
    time: advanceMinutes(state.time, minutes),
  };
}

export function advanceGameStateHours(state: GameState, hours: number): GameState {
  return {
    ...state,
    time: advanceHours(state.time, hours),
  };
}
