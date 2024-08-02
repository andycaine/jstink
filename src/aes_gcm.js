const crypto = require('crypto');

function algorithm(key) {
    if (key.length === 32) {
        return 'aes-256-gcm';
    } else if (key.length === 24) {
        return 'aes-192-gcm';
    } else if (key.length === 16) {
        return 'aes-128-gcm';
    } else {
        throw new Error('Invalid AES-GCM key length');
    }
}

function encrypt(plaintext, associatedData, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm(key), key, iv);

    if (associatedData !== undefined) {
        cipher.setAAD(Buffer.from(associatedData));
    }
    const encrypted = cipher.update(plaintext);
    const remaining = cipher.final();
    const tag = cipher.getAuthTag();
    return {
        ciphertext: Buffer.concat([encrypted, remaining]),
        iv,
        tag
    };
}

function decrypt(ciphertext, associatedData, key, iv, tag) {
    const decipher = crypto.createDecipheriv(algorithm(key), key, iv);
    if (associatedData !== undefined) {
        decipher.setAAD(Buffer.from(associatedData));
    }
    decipher.setAuthTag(Buffer.from(tag));
    let decrypted = decipher.update(ciphertext);
    decrypted += decipher.final();
    return decrypted;
}

module.exports = { encrypt, decrypt };
