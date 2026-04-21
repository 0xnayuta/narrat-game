/**
 * Quest definition tracked by state and updated by narrative/world events.
 */
export interface QuestDefinition {
  id: string;
  title: string;
  status: "inactive" | "active" | "completed" | "failed";
  stepIds: string[];
  // TODO: Replace stepIds with typed quest-step objects when quest runner exists.
}
