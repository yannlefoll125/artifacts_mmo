import { buildServer } from '@/server';

describe('server', () => {
    it('responds on /health', async () => {
        const server = buildServer();
        const response = await server.inject({ method: 'GET', url: '/health' });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: 'ok' });
        await server.close();
    });
});
