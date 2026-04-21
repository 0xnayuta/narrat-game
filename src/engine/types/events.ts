/**
 * Domain event definition for scripted triggers and system notifications.
 */
export interface EventDefinition {
  id: string;
  type: string;
  trigger: string;
  payload?: Record<string, unknown>;
  // TODO: Replace free-form trigger with typed trigger union.
}
