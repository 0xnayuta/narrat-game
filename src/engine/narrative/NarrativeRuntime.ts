/**
 * Responsibility: Minimal narrative runtime for node reading and choice-based navigation.
 * TODO: Add command/effect execution and conditional choices.
 */

import type { ChoiceOption, NarrativeChoiceEffects, NarrativeNode } from "../types";

export interface NarrativeGraph {
  startNodeId: string;
  nodes: NarrativeNode[];
}

export interface NarrativeViewModel {
  nodeId: string;
  text: string;
  choices: Array<Pick<ChoiceOption, "id" | "text">>;
}

export interface NarrativeChoiceResult {
  node: NarrativeNode;
  effects?: NarrativeChoiceEffects;
}

export class NarrativeRuntime {
  private readonly nodesById: Map<string, NarrativeNode>;
  private currentNodeId: string;

  constructor(graph: NarrativeGraph) {
    this.nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    if (!this.nodesById.has(graph.startNodeId)) {
      throw new Error(`Start node not found: ${graph.startNodeId}`);
    }
    this.currentNodeId = graph.startNodeId;
  }

  getCurrentNode(): NarrativeNode {
    const node = this.nodesById.get(this.currentNodeId);
    if (!node) {
      throw new Error(`Current node not found: ${this.currentNodeId}`);
    }
    return node;
  }

  getCurrentText(): string {
    return this.getCurrentNode().text;
  }

  getCurrentChoices(): ChoiceOption[] {
    return this.getCurrentNode().choices;
  }

  getCurrentView(): NarrativeViewModel {
    const node = this.getCurrentNode();
    return {
      nodeId: node.id,
      text: node.text,
      choices: node.choices.map((choice) => ({ id: choice.id, text: choice.text })),
    };
  }

  choose(choiceId: string): NarrativeChoiceResult {
    const current = this.getCurrentNode();
    const choice = current.choices.find((item) => item.id === choiceId);
    if (!choice) {
      throw new Error(`Choice not found: ${choiceId}`);
    }
    if (!this.nodesById.has(choice.nextNodeId)) {
      throw new Error(`Next node not found: ${choice.nextNodeId}`);
    }
    this.currentNodeId = choice.nextNodeId;
    return {
      node: this.getCurrentNode(),
      effects: choice.effects,
    };
  }

  jumpTo(nodeId: string): NarrativeNode {
    if (!this.nodesById.has(nodeId)) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    this.currentNodeId = nodeId;
    return this.getCurrentNode();
  }
}
