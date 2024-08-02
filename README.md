# jstink

A simple, easy-to-use Javascript crytopgraphy library.

## Description

Google's excellent [Tink cryptographic library](https://developers.google.com/tink/what-is) exists to help developers without cryptographic backgrounds safely implement common cryptographic tasks.

Unfortunately for Javascript developers, [there is no production-ready Javascript version](https://github.com/tink-crypto/tink/issues/689) available.

jstink was built to fill this gap. It provides a very simple API that is hard to misuse, and is compatible with Tink ciphertexts and with [Tinkey](https://developers.google.com/tink/tinkey-overview) encrypted keysets.

jstink currently only supports AES encryption in GCM mode. AES (Advanced Encryption Standard) is recommended by NIST for federal use in the encryption of classified and unclassified data. GCM (Galois/Counter Mode) is also recommended by NIST and provides authentication as well as encryption - that is it ensures the integrity and authenticity of encrypted data in addition to ensuring confidentiality. GCM also accepts associated data which is authenticated but not encrypted.

jstink currently only supports Tink keysets encrypted with AWS KMS keys.

## Getting Started

Let's walk through setting up a simple project that can encrypt and decrypt data using an AES256_GCM key that has been encrypted with a master key stored in AWS KMS. These steps assume you have Node.js and npm already installed.

1. Create a new Node.js project

2. Inside of the project, install jstink using npm:
```
npm install jstink
```

3. Create a new symmetric key in AWS KMS that will be used to encrypt our Tinkey data encryption key. This step assumes you have the [AWS CLI](https://aws.amazon.com/cli/) installed and configured:
```
aws kms create-key --description "Key for jstink encryption"
```
Make a note of the key ARN as you'll need it later.

4. [Install Tinkey](https://developers.google.com/tink/install-tinkey).

5. Create a new Tinkey key, envelope encrypted with your newly created AWS KMS key:
```
tinkey create-keyset \
    --key-template AES256_GCM \
    --out keyset.json \
    --master-key-uri aws-kms://${MASTER_KEY_ARN}
```
Because this key is envelope encrypted with the AWS KMS key you can store it with the data or with the application.

6. Now you can encrypt and decrypt data:
```javascript
const { Aead } = require('jstink');
const fs = require('fs');

const keyset = JSON.parse(fs.readFileSync('./keyset.json'));
const aead = new Aead(keyset);

const ciphertext = await aead.encrypt('Hello World!', 'associatedData');
const plaintext = await aead.decrypt(ciphertext, 'associatedData');
```

7. At some point, as determined by your cryptoperiod, you'll want to rotate your keys. Tinkey makes this nice and easy. First, create a new key:

```
tinkey add-key \
    --key-template AES256_GCM \
    --in keyset.json \
    --out keysetv2.json \
    --master-key-uri aws-kms://${MASTER_KEY_ARN}
```

Once you've deployed this keyset, you can make it the default for encryption:

```
tinkey promote-key \
    --key-id <new-key-id> \
    --in keysetv2.json \
    --out keysetv3.json \
    --master-key-uri aws-kms://${MASTER_KEY_ARN}
```

Decrypt operations will still use the key that was used for encryption (the encryption key ID is stored as part of the Tink wire format). To completely remove the old key (e.g. in the event of a compromise) you'll need to run a process to re-encrypt all data encrypted with the old key, then you can delete the old key:

```
tinkey delete-key \
    --key-id <key-id> \
    --in keysetv3.json \
    --out keysetv4.json \
    --master-key-uri aws-kms://${MASTER_KEY_ARN}
```

## Using Authenticated Associated Data (AAD)

The GCM algorithm used by jstink is an Authenticated Encryption with Associated Data (AEAD) encryption method. This means that it provides for authentication as well as confidentiality, and also allows the message to contain "associated data". This associated data is authenticated but not encrypted. A decryption operation will only work if the same associated data is used for decryption that was used for encryption.

One use of AAD is to bind a ciphertext to it's encryption context. For example, we can use a username as the associated data for data that is encrypted for a specific user:

```javascript
const ciphertext = await aead.encrypt(userData, username);
```

This can prevent attacks where encrypted data is 'cut-and-pasted' from one user to another.
