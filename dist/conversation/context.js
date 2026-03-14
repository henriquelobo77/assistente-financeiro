export function createContext(operatorJid) {
    return {
        operatorJid,
        flowId: null,
        stateId: 'idle',
        data: {},
        lastActivityAt: Date.now(),
    };
}
//# sourceMappingURL=context.js.map