import NodeRSA from 'node-rsa';
import fs from 'fs';
import path from 'path';

const KEYS_DIR = path.join(__dirname, '../../keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

// Ensure keys directory exists
if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR);
}

let key: NodeRSA;

export const initializeKeys = () => {
    if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
        const privateKeyData = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
        key = new NodeRSA(privateKeyData, undefined, { encryptionScheme: 'pkcs1' });
        console.log('RSA Keys loaded from file.');
    } else {
        console.log('Generating new 2048-bit RSA keys...');
        key = new NodeRSA({ b: 2048 });
        key.setOptions({ encryptionScheme: 'pkcs1' });

        // Export keys
        const privateKey = key.exportKey('pkcs1-private');
        const publicKey = key.exportKey('pkcs1-public');

        fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
        fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
        console.log('RSA Keys generated and saved.');
    }
};

export const getPublicKey = () => {
    if (!key) initializeKeys();
    return key.exportKey('pkcs1-public');
};

import crypto from 'crypto';

export const decrypt = (encryptedData: string) => {
    if (!key) initializeKeys();
    try {
        const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
        const buffer = Buffer.from(encryptedData, 'base64');
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            buffer
        );
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Crypto decryption failed:', error);
        throw new Error('Decryption failed');
    }
};
