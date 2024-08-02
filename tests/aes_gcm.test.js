const aes_gcm = require('../src/aes_gcm');
const crypto = require('crypto');

describe('aes_gcm', () => {
    it('should encrypt / decrypt with a 256-bit key', () => {
        const key = crypto.randomBytes(32);
        const {ciphertext, iv, tag} = aes_gcm.encrypt('Hello World!', 'customer-id1', key);
        const plaintext = aes_gcm.decrypt(ciphertext, 'customer-id1', key, iv, tag);
        expect(plaintext).toBe('Hello World!');
    });

    it('should encrypt / decrypt with a 128-bit key', () => {
        const key = crypto.randomBytes(16);
        const {ciphertext, iv, tag} = aes_gcm.encrypt('Hello World!', 'customer-id1', key);
        const plaintext = aes_gcm.decrypt(ciphertext, 'customer-id1', key, iv, tag);
        expect(plaintext).toBe('Hello World!');
    });

    it('should encrypt / decrypt with a 192-bit key', () => {
        const key = crypto.randomBytes(24);
        const {ciphertext, iv, tag} = aes_gcm.encrypt('Hello World!', 'customer-id1', key);
        const plaintext = aes_gcm.decrypt(ciphertext, 'customer-id1', key, iv, tag);
        expect(plaintext).toBe('Hello World!');
    });

});
