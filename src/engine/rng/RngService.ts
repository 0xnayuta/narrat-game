/**
 * Responsibility: Random number service with future seed support.
 * TODO: Implement deterministic seeded RNG.
 */

export class RngService {
  nextFloat(): number {
    // TODO: Replace with seeded deterministic implementation.
    return Math.random();
  }
}
