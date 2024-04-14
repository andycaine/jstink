const tink_pb = require('./tink_pb');
const aes_gcm_pb = require('./aes_gcm_pb');

function create(protobuf) {
    const ks = tink_pb.Keyset.deserializeBinary(protobuf);
    const result = {};
    for (const k of ks.getKeyList()) {
        if (k.getKeyData().getTypeUrl() !== 'type.googleapis.com/google.crypto.tink.AesGcmKey') {
            throw new Error('Unsupported key type - only AES GCM keys are currently supported');
        }
        if (k.getStatus() !== tink_pb.KeyStatusType.ENABLED) {
            continue;
        }
        if (k.getOutputPrefixType() !== tink_pb.OutputPrefixType.TINK) {
            throw new Error('Unsupported key prefix - only TINK keys are currently supported');
        }

        const keyData = aes_gcm_pb.AesGcmKey.deserializeBinary(k.getKeyData().getValue());
        result[k.getKeyId()] = keyData.getKeyValue();
    }
    return result;
}

module.exports = { create };
