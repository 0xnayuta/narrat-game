/**
 * Demo content: minimal loader/repository entry.
 */

import { StaticContentRepository, validateContentBundle } from "../../engine";
import { demoContentBundle } from "./bundle";

export function loadDemoContentBundle() {
  return validateContentBundle(demoContentBundle);
}

export function createDemoContentRepository() {
  return new StaticContentRepository(loadDemoContentBundle());
}
