const { KMSClient, DecryptCommand } = require("@aws-sdk/client-kms");

const client = new KMSClient();

async function decrypt(data) {
    const command = new DecryptCommand({
        CiphertextBlob: data
    });

    const { Plaintext } = await client.send(command);
    return Plaintext;
}

module.exports = { decrypt };
