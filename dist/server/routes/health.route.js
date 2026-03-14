export async function healthRoutes(app) {
    app.get('/health', async (_request, reply) => {
        return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
    });
}
//# sourceMappingURL=health.route.js.map