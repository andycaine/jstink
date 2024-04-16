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

/**
 * Authenticated Encryption with Associated Data (AEAD).
 *
 */
class Aead {

    /**
     *
     * @param {object} keyset   The AWK KMS encrypted Tink keyset
     */
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

    /**
     * Encrypts the plaintext with the associated data as associated authenticated data.
     *
     * @param {string|Buffer} plaintext - the plaintext to be encrypted.
     * @param {string|Buffer} associatedData - the associated data to be authenticated but not
     *                                         encrypted. For successful decryption the same
     *                                         associatedData must be provided.
     * @returns {Promise<Buffer>} - the ciphertext.
     */
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

    /**
     *
     * @param {Buffer} encrypted - the ciphertext to be decrypted.
     * @param {string|Buffer} associatedData - the associated data to be authenticated.
     *                                         For successful decryption must be the same
     *                                         as used during encryption.
     * @returns {Promise<Buffer>} - the plaintext.
     */
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
