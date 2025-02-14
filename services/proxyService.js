const { HttpsProxyAgent } = require("https-proxy-agent");
const { SocksProxyAgent } = require("socks-proxy-agent");
const CONFIG = require("../config/config");

class ProxyService {
  constructor() {
    this.proxy = CONFIG.PROXY.CREDENTIALS;
    this.failureCount = 0;
  }

  getProxyAgent() {
    try {
      if (!CONFIG.PROXY.ENABLED) return null;

      const { protocol, username, password, host, port } = this.proxy;
      const proxyUrl = `${protocol}://${username}:${password}@${host}:${port}`;

      const options = {
        proxy: proxyUrl,
        rejectUnauthorized: false,
        timeout: CONFIG.PROXY.TIMEOUT,
      };

      if (protocol === "socks5") {
        return new SocksProxyAgent(proxyUrl);
      }
      return new HttpsProxyAgent(proxyUrl);
    } catch (error) {
      console.error(`Error creating proxy agent: ${error.message}`);
      return null;
    }
  }

  getFormattedProxyUrl() {
    const { host, port } = this.proxy;
    return `${host}:${port}`;
  }

  validateProxy() {
    const requiredFields = ["protocol", "host", "port", "username", "password"];
    return requiredFields.every((field) => this.proxy[field]);
  }
}

module.exports = new ProxyService();
