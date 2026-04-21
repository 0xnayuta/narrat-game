/**
 * Responsibility: Resolve NPC interaction availability from state and static NPC definitions.
 */

import type { GameState, NPCDefinition, NPCInteractionRule } from "../types";
import {
  evaluateNpcInteractionConditions,
  matchesNpcInteractionRule,
  type NpcInteractionMismatchReason,
} from "./NpcInteractionMatcher";

export interface NpcInteractionRuleDebugEntry {
  ruleId: string;
  label: string;
  nodeId: string;
  matched: boolean;
  reasons: NpcInteractionMismatchReason[];
}

export interface NpcInteractionDebugEntry {
  npcId: string;
  npcName: string;
  resolvedInteractionId: string | null;
  rules: NpcInteractionRuleDebugEntry[];
}

export interface AvailableNpcInteraction {
  npcId: string;
  npcName: string;
  label: string;
  nodeId: string;
}

export function resolveNpcInteraction(
  state: GameState,
  npc: NPCDefinition,
): NPCInteractionRule | null {
  if (!npc.interactions || npc.interactions.length === 0) {
    return null;
  }

  return (
    npc.interactions.find((rule) => matchesNpcInteractionRule(state, rule)) ?? null
  );
}

export function getAvailableNpcInteractions(
  state: GameState,
  npcs: NPCDefinition[],
): AvailableNpcInteraction[] {
  return npcs
    .filter((npc) => npc.homeLocationId === state.currentLocationId)
    .map((npc) => {
      const interaction = resolveNpcInteraction(state, npc);
      if (!interaction) {
        return null;
      }
      return {
        npcId: npc.id,
        npcName: npc.name,
        label: interaction.label,
        nodeId: interaction.nodeId,
      };
    })
    .filter((entry): entry is AvailableNpcInteraction => entry !== null);
}

export function getNpcInteractionDebugInfo(
  state: GameState,
  npcs: NPCDefinition[],
): NpcInteractionDebugEntry[] {
  return npcs
    .filter((npc) => npc.homeLocationId === state.currentLocationId)
    .map((npc) => {
      const rules = (npc.interactions ?? []).map((rule) => {
        const result = evaluateNpcInteractionConditions(state, rule);
        return {
          ruleId: rule.id,
          label: rule.label,
          nodeId: rule.nodeId,
          matched: result.matched,
          reasons: result.reasons,
        };
      });

      return {
        npcId: npc.id,
        npcName: npc.name,
        resolvedInteractionId: resolveNpcInteraction(state, npc)?.id ?? null,
        rules,
      };
    });
}
