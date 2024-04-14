const keysets = require('../src/keysets');
const fs = require('fs');

describe('keysets', () => {
    it('should parse keyset from protobuf', () => {
        const protobuf = fs.readFileSync('./tests/keyset.protobuf');
        const keyset = keysets.create(protobuf);
        const testKeyId = '1902300492';

        expect(keyset).toHaveProperty(testKeyId);
        expect(keyset[testKeyId]).toEqual(new Uint8Array([
            66, 178, 69, 234, 142, 47, 134, 16, 40, 116, 14, 29, 11, 66, 208,
            227, 3, 218, 151, 211, 193, 210, 42, 252, 234, 12, 0, 23, 82, 14,
            200, 24,
        ]));
    });
});
