const { Aead } = require('../src/index');
const fs = require('fs');


jest.mock('@aws-sdk/client-kms', () => {
    const fs = require('fs');
    const protobuf = fs.readFileSync('./tests/keyset.protobuf');

    const originalModule = jest.requireActual("@aws-sdk/client-kms");
    return {
        ...originalModule,
        KMSClient: jest.fn(() => ({
            send: jest.fn().mockImplementation((command) => {
            if (command instanceof originalModule.DecryptCommand) {
                // Mocked response for the decrypt command
                return Promise.resolve({
                    Plaintext: protobuf
                });
            }
            throw new Error("Unmocked command");
            })
        }))
    };
});

describe('jstink', () => {
    it('should encrypt and decrypt', async () => {
        const keyset = JSON.parse(fs.readFileSync('tests/keyset.json'));
        const aead = new Aead(keyset);

        const ciphertext = await aead.encrypt('Hello World!', 'customer-id1');
        const plaintext = await aead.decrypt(ciphertext, 'customer-id1');
        expect(plaintext).toBe('Hello World!');
    });

    it('should decrypt', async () => {
        const keyset = JSON.parse(fs.readFileSync('tests/keyset.json'));
        const aead = new Aead(keyset);
        const ciphertext = fs.readFileSync('tests/encrypted.dat');
        const plaintext = await aead.decrypt(ciphertext, 'customer-id1');
        expect(plaintext).toBe('Hello World!');
    });

});
