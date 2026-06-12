const ITERATIONS = 600000;
const KEY_LENGTH = 256;

export const CryptoService = {
  /**
   * Derives a master key from a password and salt.
   * @param {string} password 
   * @param {Uint8Array} salt 
   * @returns {Promise<CryptoKey>}
   */
  async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  },

  /**
   * Encrypts a string.
   * @param {string} plainText 
   * @param {CryptoKey} key 
   * @returns {Promise<{ciphertext: ArrayBuffer, iv: Uint8Array}>}
   */
  async encrypt(plainText, key) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(plainText)
    );

    return {
      ciphertext,
      iv
    };
  },

  /**
   * Decrypts a ciphertext.
   * @param {ArrayBuffer} ciphertext 
   * @param {Uint8Array} iv 
   * @param {CryptoKey} key 
   * @returns {Promise<string>}
   */
  async decrypt(ciphertext, iv, key) {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  },

  /**
   * Wipes a Uint8Array
   * @param {Uint8Array} array 
   */
  wipe(array) {
    array.fill(0);
  }
};
