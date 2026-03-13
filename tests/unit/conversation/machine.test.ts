import { describe, it, expect, vi } from 'vitest';
import { applyTransition, processMessage, END_FLOW, type FlowDefinition, type StateHandler } from '../../../src/conversation/machine.js';
import { createContext, type ConversationContext } from '../../../src/conversation/context.js';
import { MessageKind, type MessageIn } from '../../../src/types/message.types.js';

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  fatal: vi.fn(),
  trace: vi.fn(),
  level: 'silent',
  child: vi.fn(),
} as any;

function makeMessage(text: string): MessageIn {
  return {
    jid: 'test@s.whatsapp.net',
    text,
    kind: MessageKind.Text,
    timestamp: Date.now(),
    rawPayload: {},
  };
}

describe('applyTransition', () => {
  it('updates state and flow', () => {
    const ctx = createContext('test@s.whatsapp.net');
    const result = applyTransition(ctx, {
      nextState: 'create_value',
      nextFlow: 'charge',
      updatedData: { step: 1 },
    });

    expect(result.stateId).toBe('create_value');
    expect(result.flowId).toBe('charge');
    expect(result.data).toEqual({ step: 1 });
  });

  it('END_FLOW resets to idle', () => {
    const ctx: ConversationContext = {
      operatorJid: 'test@s.whatsapp.net',
      flowId: 'charge',
      stateId: 'create_value',
      data: { some: 'data' },
      lastActivityAt: Date.now(),
    };

    const result = applyTransition(ctx, END_FLOW);
    expect(result.flowId).toBeNull();
    expect(result.stateId).toBe('idle');
    expect(result.data).toEqual({});
  });
});

describe('processMessage', () => {
  it('delegates to main-menu when no active flow', async () => {
    const handler: StateHandler = vi.fn().mockResolvedValue({
      nextState: 'select_action',
      nextFlow: 'charge',
    });

    const mainMenu: FlowDefinition = {
      id: 'main-menu',
      initialState: 'show_menu',
      states: { show_menu: handler },
    };

    const flows = new Map([['main-menu', mainMenu]]);
    const ctx = createContext('test@s.whatsapp.net');
    const msg = makeMessage('1');

    const result = await processMessage(ctx, msg, flows, mockLogger);
    expect(handler).toHaveBeenCalledOnce();
    expect(result.flowId).toBe('charge');
    expect(result.stateId).toBe('select_action');
  });

  it('delegates to active flow and state', async () => {
    const handler: StateHandler = vi.fn().mockResolvedValue({
      nextState: 'create_due_date',
      updatedData: { value: 15000 },
    });

    const chargeFlow: FlowDefinition = {
      id: 'charge',
      initialState: 'select_action',
      states: { create_value: handler },
    };

    const flows = new Map([['charge', chargeFlow]]);
    const ctx: ConversationContext = {
      operatorJid: 'test@s.whatsapp.net',
      flowId: 'charge',
      stateId: 'create_value',
      data: {},
      lastActivityAt: Date.now(),
    };

    const result = await processMessage(ctx, makeMessage('150,00'), flows, mockLogger);
    expect(handler).toHaveBeenCalledOnce();
    expect(result.stateId).toBe('create_due_date');
    expect(result.data).toEqual({ value: 15000 });
  });

  it('returns END_FLOW when flow not found', async () => {
    const flows = new Map<string, FlowDefinition>();
    const ctx: ConversationContext = {
      operatorJid: 'test@s.whatsapp.net',
      flowId: 'nonexistent',
      stateId: 'some_state',
      data: {},
      lastActivityAt: Date.now(),
    };

    const result = await processMessage(ctx, makeMessage('test'), flows, mockLogger);
    expect(result.flowId).toBeNull();
    expect(result.stateId).toBe('idle');
  });
});
