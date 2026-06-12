import { CryptoService } from './crypto'

export const AuthService = {
  /**
   * Derives and stores the master key in memory.
   * @param {string} password 
   * @param {Uint8Array} salt 
   * @returns {Promise<CryptoKey>}
   */
  async initialize(password, salt) {
    const key = await CryptoService.deriveKey(password, salt);
    // Store in a variable that is only accessible during the current session
    window.__MASTER_KEY__ = key;
    return key;
  },

  getMasterKey() {
    return window.__MASTER_KEY__;
  },

  isAuthenticated() {
    return window.__MASTER_KEY__ !== undefined;
  },

  wipeKey() {
    delete window.__MASTER_KEY__;
  }
}
