const ciphertexts = require('../src/ciphertexts');
const fs = require('fs');

describe('ciphertexts', () => {

    it('should parse encrypted data', () => {
        const encrypted = fs.readFileSync('./tests/encrypted.dat');
        const {keyId, iv, ciphertext, tag} = ciphertexts.parse(encrypted);
        expect(keyId).toEqual('1902300492');
        expect(iv).toEqual(Buffer.from([
            102, 74, 139, 63, 237, 243, 193, 181, 128, 93, 61, 165
        ]));
        expect(ciphertext).toEqual(Buffer.from([
            96, 225, 81, 27, 80, 6, 153, 127, 14, 150, 85, 211
        ]));
        expect(tag).toEqual(Buffer.from([
            73, 196, 242, 175, 124, 206, 144, 15, 144, 25, 232, 101, 110, 198, 29, 132
        ]));
    });

    it('should create encrypted data in Tink format', () => {
        const keyId = '1902300492';
        const iv = Buffer.from([
            102, 74, 139, 63, 237, 243, 193, 181, 128, 93, 61, 165
        ]);
        const ciphertext = Buffer.from([
            96, 225, 81, 27, 80, 6, 153, 127, 14, 150, 85, 211
        ]);
        const tag = Buffer.from([
            73, 196, 242, 175, 124, 206, 144, 15, 144, 25, 232, 101, 110, 198, 29, 132
        ]);
        const encrypted = ciphertexts.create({keyId, iv, ciphertext, tag});
        expect(encrypted).toEqual(Buffer.from([
            1, // version
            113, 98, 205, 76, // key id as 4-byte BE int
            102, 74, 139, 63, 237, 243, 193, 181, 128, 93, 61, 165, // iv
            96, 225, 81, 27, 80, 6, 153, 127, 14, 150, 85, 211, // ciphertext
            73, 196, 242, 175, 124, 206, 144, 15, 144, 25, 232, 101, 110, 198, 29, 132 // tag
        ]));
    });
});
