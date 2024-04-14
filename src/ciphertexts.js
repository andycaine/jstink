
const ivSizeInBytes = 12; // Tink uses 12 bytes for the IV
const tagSizeInBytes = 16; // Tink uses 16 bytes for the tag
const tinkOutputPrefixVersion = 1;
const prefixSizeInBytes = 5;

function parse(buffer) {
    if (buffer[0] != tinkOutputPrefixVersion) {
        throw new Error('Unsupported version');
    }
    const keyId = `${buffer.slice(1, prefixSizeInBytes).readInt32BE()}`;
    const iv = buffer.slice(prefixSizeInBytes, prefixSizeInBytes + ivSizeInBytes);
    const ciphertext = buffer.slice(prefixSizeInBytes + ivSizeInBytes,
                                    buffer.length - tagSizeInBytes);
    const tag = buffer.slice(buffer.length - tagSizeInBytes);
    return {
        keyId,
        iv,
        ciphertext,
        tag
    };
}

function create({keyId, ciphertext, iv, tag}) {
    const prefix = Buffer.alloc(prefixSizeInBytes);
    prefix.writeInt8(tinkOutputPrefixVersion);
    prefix.writeInt32BE(parseInt(keyId), 1);
    return Buffer.concat([prefix, iv, ciphertext, tag]);
}

module.exports = { parse, create };
