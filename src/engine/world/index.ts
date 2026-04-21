/**
 * Responsibility: Public API for world/location navigation module.
 */

export type {
  AvailableNpcInteraction,
  NpcInteractionDebugEntry,
  NpcInteractionRuleDebugEntry,
} from "./NpcService";
export type { LocationEnterHookContext, SwitchLocationOptions } from "./LocationService";
export type { NpcInteractionMatchResult, NpcInteractionMismatchReason } from "./NpcInteractionMatcher";
export { evaluateNpcInteractionConditions, matchesNpcInteractionRule } from "./NpcInteractionMatcher";
export { getAvailableNpcInteractions, getNpcInteractionDebugInfo, resolveNpcInteraction } from "./NpcService";
export { LocationService } from "./LocationService";
