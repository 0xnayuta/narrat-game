/**
 * Responsibility: Public API for minimal event trigger framework.
 */

export {
  matchesAllEventConditions,
  matchesAnyConditionGroup,
  matchesEventHistoryCondition,
  matchesFlagCondition,
  matchesLocationCondition,
  matchesQuestCondition,
  matchesQuestStepCondition,
  matchesTimeCondition,
  matchesVarCondition,
} from "./conditions";

export { getCandidateEvents, selectEvent, selectResolvedEvent, selectFirstEvent } from "./selector";
export {
  EVENT_ONCE_TRIGGERED_FLAG_KEY_PREFIX,
  EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_PREFIX,
  EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_SUFFIX,
  DEFAULT_EVENT_HISTORY_WRITE_STRATEGY,
  getEventTriggeredFlagId,
  getEventCooldownVarKey,
  readEventHistoryState,
  writeEventHistoryState,
  migrateLegacyEventHistoryToSlice,
  hasTriggeredOnceEvent,
  hasEventCooldownActive,
  markEventTriggered,
  markEventCooldownTimestamp,
} from "./history";
export type { EventHistoryWriteStrategy } from "./history";
