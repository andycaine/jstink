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

    const keyset = JSON.parse(fs.readFileSync('tests/keyset.json'));
    const aead = new Aead(keyset);

    it('should encrypt and decrypt', async () => {
        const ciphertext = await aead.encrypt('Hello World!', 'customer-id1');
        const plaintext = await aead.decrypt(ciphertext, 'customer-id1');
        expect(plaintext).toBe('Hello World!');
    });

    it('should encrypt and decrypt without associated data', async () => {
        const ciphertext = await aead.encrypt('Hello World!');
        const plaintext = await aead.decrypt(ciphertext);

        expect(plaintext).toBe('Hello World!');
    });

    it('should authenticate associated data', async () => {
        const ciphertext = await aead.encrypt('Hello World!', 'foo');
        await expect(aead.decrypt(ciphertext, 'bar')).rejects.toThrow(
            'Unsupported state or unable to authenticate data'
        );
    });

    it('should decrypt', async () => {
        const ciphertext = fs.readFileSync('tests/encrypted.dat');
        const plaintext = await aead.decrypt(ciphertext, 'customer-id1');
        expect(plaintext).toBe('Hello World!');
    });

});
