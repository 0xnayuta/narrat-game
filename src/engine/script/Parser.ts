/**
 * Responsibility: Parse scene/script source data into runtime-friendly collections.
 * Status: Skeleton only. Not connected to the current demo UI/content path, which uses
 * direct ContentBundle objects and NarrativeRuntime instead of a parser pipeline.
 * TODO: Revisit when external JSON/YAML/script loading is introduced.
 */

import type { SceneCollection } from "../content/schema";

export class Parser {
  parse(raw: unknown): SceneCollection {
    // TODO: Implement runtime validation and conversion.
    return raw as SceneCollection;
  }
}
