const CONFIG = {
  API_BASE_URL: "https://nodego.ai",
  CHECK_IP_URL: "https://api.bigdatacloud.net/data/client-ip",
  PING_INTERVAL: 10000,
  UI: {
    GRID: {
      ROWS: 8,
      COLS: 12,
    },
    TABLE: {
      COLUMN_WIDTH: [20, 15, 15, 20, 40],
    },
  },
  API: {
    TIMEOUT: 10000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000,
  },
  PROXY: {
    ENABLED: true,
    CREDENTIALS: {
      protocol: "http",
      host: "your-proxy-host",
      port: "your-proxy-port",
      username: "your-proxy-username",
      password: "your-proxy-password",
    },
    TIMEOUT: 10000,
    RETRY_DELAY: 1000,
  },
};

module.exports = CONFIG;
