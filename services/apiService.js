const axios = require("axios");
const CONFIG = require("../config/config");
const ProxyService = require("./proxyService");

class ApiService {
  constructor() {
    this.logger = null;
  }

  setLogger(logger) {
    this.logger = logger;
  }

  async createAxiosInstance(customConfig = {}) {
    const config = {
      timeout: CONFIG.API.TIMEOUT,
      ...customConfig,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
    };

    if (CONFIG.PROXY.ENABLED && ProxyService.validateProxy()) {
      const agent = ProxyService.getProxyAgent();
      if (agent) {
        config.httpsAgent = agent;
        config.httpAgent = agent;
        this.logger?.log(`Using proxy: ${ProxyService.getFormattedProxyUrl()}`);
      }
    }

    return axios.create(config);
  }

  async handleRateLimit(error, retryCount) {
    if (error.response && error.response.status === 429) {
      const delay = Math.min(Math.pow(2, retryCount) * 5000, 30000); // exponential backoff dengan max 30 detik
      this.logger?.log(
        `Rate limited. Waiting ${delay / 1000} seconds before retry...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return true;
    }
    return false;
  }

  async executeWithRetry(operation, maxRetries = CONFIG.API.MAX_RETRIES) {
    let retryCount = 0;

    while (true) {
      try {
        return await operation();
      } catch (error) {
        retryCount++;

        if (await this.handleRateLimit(error, retryCount)) {
          continue;
        }

        if (retryCount >= maxRetries) {
          throw error;
        }

        const delay = CONFIG.API.RETRY_DELAY;
        this.logger?.log(
          `Retry attempt ${retryCount}. Waiting ${delay / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async checkIp() {
    return this.executeWithRetry(async () => {
      const axiosInstance = await this.createAxiosInstance();
      const response = await axiosInstance.get(CONFIG.CHECK_IP_URL);
      return response.data;
    });
  }

  async getUserInfo(token) {
    return this.executeWithRetry(async () => {
      const axiosInstance = await this.createAxiosInstance({
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const response = await axiosInstance.get(
        `${CONFIG.API_BASE_URL}/api/user/me`
      );
      return response.data;
    });
  }

  async doPing(token) {
    return this.executeWithRetry(async () => {
      const axiosInstance = await this.createAxiosInstance({
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const response = await axiosInstance.post(
        `${CONFIG.API_BASE_URL}/api/user/nodes/ping`,
        { type: "extension" }
      );
      return response.data;
    });
  }
}

module.exports = new ApiService();
