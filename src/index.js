const keysets = require('./keysets');
const awskms = require('./awskms');
const aes_gcm = require('./aes_gcm');
const ciphertexts = require('./ciphertexts');

async function decryptKeyset(encryptedKeyset) {
    const keysetProtobuf = await awskms.decrypt(
        Buffer.from(encryptedKeyset, 'base64')
    );
    return keysets.create(keysetProtobuf);
}

class Aead {

    constructor(keyset) {
        if (!keyset.encryptedKeyset) {
            throw new Error('keyset must contain an encryptedKeyset property');
        }
        this.keyset = keyset;
    }

    init = async () => {
        if (!this.decryptedKeys) {
            this.decryptedKeys = await decryptKeyset(this.keyset.encryptedKeyset);
        }
    }

    encrypt = async (plaintext, associatedData) => {
        await this.init();
        const key = this.decryptedKeys[this.keyset.keysetInfo.primaryKeyId];
        const {iv, ciphertext, tag} = aes_gcm.encrypt(plaintext, associatedData, key);
        return ciphertexts.create({
            keyId: this.keyset.keysetInfo.primaryKeyId,
            ciphertext,
            iv,
            tag
        });
    }

    decrypt = async (encrypted, associatedData) => {
        await this.init();
        const {keyId, ciphertext, tag, iv} = ciphertexts.parse(encrypted);
        const key = this.decryptedKeys[keyId];
        return aes_gcm.decrypt(ciphertext, associatedData, key, iv, tag);
    }

}

module.exports = {
    Aead
};
