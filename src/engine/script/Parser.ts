/**
 * Responsibility: Parse narrative source data into runtime-friendly scene nodes.
 * TODO: Support validated schema parsing and compile-time checks.
 */

import type { SceneCollection } from "@/engine/content/schema";

export class Parser {
  parse(raw: unknown): SceneCollection {
    // TODO: Implement runtime validation and conversion.
    return raw as SceneCollection;
  }
}
