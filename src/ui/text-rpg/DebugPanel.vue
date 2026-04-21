<!--
  Responsibility: Render a compact debug/status snapshot for the demo session.
-->
<template>
  <section class="debug-panel">
    <h2>Debug</h2>
    <div class="debug-panel__grid">
      <div>
        <h3>Session</h3>
        <p><strong>App mode:</strong> {{ appMode }}</p>
        <p><strong>Can travel:</strong> {{ canTravel ? "yes" : "no" }}</p>
        <p><strong>Active scene:</strong> {{ hasActiveScene ? "yes" : "no" }}</p>
        <p><strong>Closable:</strong> {{ canCloseScene ? "yes" : "no" }}</p>
        <p><strong>Scene id:</strong> {{ sceneId ?? "none" }}</p>
        <p><strong>Last event:</strong> {{ lastEventId ?? "none" }}</p>
      </div>

      <div>
        <h3>Once events</h3>
        <p v-if="triggeredOnceEvents.length === 0">none</p>
        <ul v-else>
          <li v-for="eventId in triggeredOnceEvents" :key="eventId">{{ eventId }}</li>
        </ul>
      </div>

      <div>
        <h3>Flags</h3>
        <p v-if="activeFlags.length === 0">none</p>
        <ul v-else>
          <li v-for="flag in activeFlags" :key="flag.key">{{ flag.key }} = {{ flag.value }}</li>
        </ul>
      </div>

      <div>
        <h3>Vars</h3>
        <p v-if="vars.length === 0">none</p>
        <ul v-else>
          <li v-for="entry in vars" :key="entry.key">{{ entry.key }} = {{ entry.value }}</li>
        </ul>
      </div>

      <div>
        <h3>Quests</h3>
        <p v-if="quests.length === 0">none</p>
        <ul v-else>
          <li v-for="quest in quests" :key="quest.id">
            {{ quest.id }} → {{ quest.status }} ({{ quest.stepId ?? "no-step" }})
          </li>
        </ul>
      </div>

      <div>
        <h3>NPC Interaction Debug</h3>
        <p v-if="npcDebug.length === 0">none</p>
        <ul v-else>
          <li v-for="npc in npcDebug" :key="npc.npcId">
            <strong>{{ npc.npcName }}</strong>
            (resolved: {{ npc.resolvedInteractionId ?? "none" }}, blocked reasons: {{ getNpcBlockedReasonCount(npc) }}, codes: {{ getNpcReasonCodeSummary(npc) }})
            <ul>
              <li v-for="rule in npc.rules" :key="rule.ruleId">
                {{ rule.ruleId }}
                [{{ rule.matched ? "matched" : `blocked (${rule.reasons.length})` }}]
                <span v-if="!rule.matched && rule.reasons.length > 0">
                  - {{ getRuleReasonCompactSummary(rule) }}
                  <button
                    type="button"
                    @click="toggleRuleDetails(npc.npcId, rule.ruleId)"
                  >
                    {{ isRuleDetailsOpen(npc.npcId, rule.ruleId) ? "hide details" : "show details" }}
                  </button>
                </span>
                <ul
                  v-if="
                    !rule.matched &&
                    rule.reasons.length > 0 &&
                    isRuleDetailsOpen(npc.npcId, rule.ruleId)
                  "
                >
                  <li
                    v-for="group in groupNpcReasonsByCode(rule.reasons)"
                    :key="`group:${rule.ruleId}:${group.code}`"
                  >
                    <strong>{{ reasonGroupLabels[group.code] }}</strong>
                    <ul>
                      <li
                        v-for="reason in group.reasons"
                        :key="`${reason.code}:${reason.key ?? reason.message}`"
                      >
                        {{ reason.message }}
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface FlagEntry {
  key: string;
  value: boolean;
}

interface VarEntry {
  key: string;
  value: string | number | boolean;
}

interface QuestEntry {
  id: string;
  status: string;
  stepId: string | null;
}

type NpcReasonCode = "flag" | "quest" | "var" | "timeOfDay";

interface NpcReasonDebugEntry {
  code: NpcReasonCode;
  key?: string;
  expected?: string | number | boolean;
  actual?: string | number | boolean | "missing";
  message: string;
}

interface NpcRuleDebugEntry {
  ruleId: string;
  matched: boolean;
  reasons: NpcReasonDebugEntry[];
}

interface NpcDebugEntry {
  npcId: string;
  npcName: string;
  resolvedInteractionId: string | null;
  rules: NpcRuleDebugEntry[];
}

const reasonGroupOrder: NpcReasonCode[] = ["flag", "quest", "var", "timeOfDay"];

const reasonGroupLabels: Record<NpcReasonCode, string> = {
  flag: "Flags",
  quest: "Quests",
  var: "Vars",
  timeOfDay: "Time",
};

function groupNpcReasonsByCode(reasons: NpcReasonDebugEntry[]) {
  return reasonGroupOrder
    .map((code) => ({
      code,
      reasons: reasons.filter((reason) => reason.code === code),
    }))
    .filter((group) => group.reasons.length > 0);
}

function getNpcBlockedReasonCount(npc: NpcDebugEntry): number {
  return npc.rules.reduce((total, rule) => total + (rule.matched ? 0 : rule.reasons.length), 0);
}

function getNpcReasonCodeSummary(npc: NpcDebugEntry): string {
  const counts = reasonGroupOrder.map((code) => ({
    code,
    count: npc.rules.reduce(
      (total, rule) => total + rule.reasons.filter((reason) => reason.code === code).length,
      0,
    ),
  }));

  const nonZero = counts.filter((entry) => entry.count > 0);
  if (nonZero.length === 0) {
    return "none";
  }

  return nonZero.map((entry) => `${entry.code}:${entry.count}`).join(", ");
}

function getRuleReasonCompactSummary(rule: NpcRuleDebugEntry): string {
  if (rule.reasons.length === 0) {
    return "no reasons";
  }

  const [first, ...rest] = rule.reasons;
  if (rest.length === 0) {
    return first.message;
  }

  return `${first.message} (+${rest.length})`;
}

const openRuleDetails = ref<Record<string, boolean>>({});

function getRuleDetailsKey(npcId: string, ruleId: string): string {
  return `${npcId}:${ruleId}`;
}

function isRuleDetailsOpen(npcId: string, ruleId: string): boolean {
  return openRuleDetails.value[getRuleDetailsKey(npcId, ruleId)] ?? false;
}

function toggleRuleDetails(npcId: string, ruleId: string): void {
  const key = getRuleDetailsKey(npcId, ruleId);
  openRuleDetails.value[key] = !isRuleDetailsOpen(npcId, ruleId);
}

defineProps<{
  appMode: string;
  canTravel: boolean;
  hasActiveScene: boolean;
  canCloseScene: boolean;
  sceneId: string | null;
  lastEventId: string | null;
  triggeredOnceEvents: string[];
  activeFlags: FlagEntry[];
  vars: VarEntry[];
  quests: QuestEntry[];
  npcDebug: NpcDebugEntry[];
}>();
</script>
