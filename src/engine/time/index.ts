/**
 * Responsibility: Public time module exports.
 */

export type { TimeOfDay, TimeRange } from "./time";
export {
  advanceMinutes,
  advanceHours,
  getCurrentTimeLabel,
  getTimeOfDay,
  isInTimeRange,
  advanceGameStateMinutes,
  advanceGameStateHours,
} from "./time";
