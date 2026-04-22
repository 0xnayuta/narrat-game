/**
 * Shared predicate/value types used by event and NPC condition systems.
 */

export type ComparableValue = string | number | boolean;

/**
 * Non-recursive scalar operator predicate.
 *
 * All specified operators must pass (AND semantics).
 * Examples:
 * - { ">=": 10, "<": 20 }
 * - { "!=": "banned" }
 * - { in: ["morning", "afternoon"] }
 */
export interface BaseScalarOperatorPredicate {
  ">="?: number;
  ">"?: number;
  "<="?: number;
  "<"?: number;
  "!="?: ComparableValue;
  in?: ComparableValue[];
}

/**
 * Scalar operator predicate with minimal NOT support.
 *
 * Example:
 * - { not: "rest" }
 * - { not: { ">=": 15 } }
 */
export interface ScalarOperatorPredicate extends BaseScalarOperatorPredicate {
  not?: ComparableValue | BaseScalarOperatorPredicate;
}

/**
 * Supported value form for scalar conditions:
 * - direct equality (string/number/boolean)
 * - operator predicate object
 */
export type ScalarConditionValue = ComparableValue | ScalarOperatorPredicate;
