/**
 * Responsibility: Public API for minimal event trigger framework.
 */

export {
  matchesAllEventConditions,
  matchesFlagCondition,
  matchesLocationCondition,
  matchesTimeCondition,
} from "./conditions";

export { getCandidateEvents, selectEvent, selectResolvedEvent, selectFirstEvent } from "./selector";
export { getEventTriggeredFlagId, hasTriggeredOnceEvent, markEventTriggered } from "./history";
