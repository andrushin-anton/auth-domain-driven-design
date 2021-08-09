import { logoutAction } from "../src/application/logout-action";
import { InMemoryAccessTokenRepository } from "../src/infrastructure/access-token/in-memory-access-token-repository";

describe('Testing loout functionality', () => {
    test('Should successfully remove the auth cookie', async () => {
        const mockRequest = {
            auth: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZiNGZhNTVkLWVlNzktNGIxYS1hZGFlLTc5NWM4NTY1MzliMyIsIm5hbWUiOiJhdXRoIiwic2VydmVyIjoiaWN1Yy5zb2NpYWwiLCJpYXQiOjE2MDY4MzcxNTR9.IAIED4Yz-UvUrpYxL6sHsPT4UNHT8P9JmQInHBFseac"
        };
        const mockResponse = {};
        const inMemoryAccessTokenRepository = new InMemoryAccessTokenRepository(
            mockRequest,
            mockResponse
        );
        await logoutAction(inMemoryAccessTokenRepository);
        expect({auth: null}).toEqual(inMemoryAccessTokenRepository.getResponse());
    });
});