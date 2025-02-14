const blessed = require("blessed");
const contrib = require("blessed-contrib");
const CONFIG = require("./config/config");
const ApiService = require("./services/apiService");
const FileService = require("./services/fileService");
const ProxyService = require("./services/proxyService");
const Dashboard = require("./ui/dashboard");
const LogBox = require("./ui/logBox");
const Logger = require("./utils/logger");
const BannerBox = require("./ui/bannerBox");

class PingAutomation {
  constructor() {
    this.setupScreen();
    this.setupServices();
    this.accounts = [];
    this.loadAccounts();
    this.startAutomation();
  }

  setupScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "NodeGo Ping Automation",
    });

    this.grid = new contrib.grid({
      rows: CONFIG.UI.GRID.ROWS,
      cols: CONFIG.UI.GRID.COLS,
      screen: this.screen,
    });

    this.banner = new BannerBox(this.grid, this.screen);
    this.dashboard = new Dashboard(this.grid, this.screen);
    this.logBox = new LogBox(this.grid, this.screen);
    this.logger = new Logger(this.logBox);

    this.screen.key(["escape", "q", "C-c"], () => {
      process.exit(0);
    });
  }

  setupServices() {
    this.apiService = ApiService;
    this.apiService.setLogger(this.logger);
    this.fileService = FileService;

    if (CONFIG.PROXY.ENABLED && ProxyService.validateProxy()) {
      this.logger.log(`Proxy enabled: ${ProxyService.getFormattedProxyUrl()}`);
    }
  }

  async loadAccounts() {
    this.accounts = await this.fileService.loadAccounts(this.logger);
    this.dashboard.update(this.accounts);
  }

  async processAccount(account, index) {
    let retryCount = 0;

    const tryOperation = async () => {
      try {
        const ipResult = await this.apiService.checkIp();
        this.logger.log(`IP Check successful: ${JSON.stringify(ipResult)}`);

        const userInfo = await this.apiService.getUserInfo(account.token);
        this.accounts[index].username = userInfo.metadata.username;
        this.accounts[index].points =
          userInfo.metadata.nodes[0]?.totalPoint.toFixed(6) || "0";
        this.accounts[index].uptime =
          userInfo.metadata.nodes[0]?.totalUptime.toFixed(2) || "0";

        const pingResult = await this.apiService.doPing(account.token);

        if (pingResult.statusCode === 200 || pingResult.statusCode === 201) {
          this.accounts[index].status = "Active";
          this.accounts[index].lastPing = new Date().toLocaleTimeString();
          this.logger.log(
            `Successful ping for ${this.accounts[index].username}`
          );
        } else {
          throw new Error(
            `Invalid ping response: ${JSON.stringify(pingResult)}`
          );
        }
      } catch (error) {
        if (retryCount < CONFIG.API.MAX_RETRIES) {
          retryCount++;
          this.logger.log(
            `Retry attempt ${retryCount} for account ${index + 1}...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, CONFIG.API.RETRY_DELAY)
          );
          return tryOperation();
        }

        this.accounts[index].status = "Error";
        const errorMessage = error.response
          ? `Status ${error.response.status}: ${JSON.stringify(
              error.response.data
            )}`
          : error.message;
        this.logger.log(
          `Error processing account ${
            index + 1
          } after ${retryCount} retries: ${errorMessage}`
        );
      }
    };

    await tryOperation();
    this.dashboard.update(this.accounts);
  }

  async startAutomation() {
    this.logger.log("Starting automation...");

    for (let i = 0; i < this.accounts.length; i++) {
      await this.processAccount(this.accounts[i], i);
    }

    let countdown = CONFIG.PING_INTERVAL / 1000;

    const timer = setInterval(() => {
      countdown--;
      if (countdown % 10 === 0 || countdown <= 5) {
        this.logger.log(`Next ping in ${countdown} seconds...`);
      }

      if (countdown <= 0) {
        countdown = CONFIG.PING_INTERVAL / 1000;
        this.logger.log("Starting new ping cycle...");
        this.accounts.forEach((account, index) => {
          this.processAccount(account, index);
        });
      }
    }, 1000);

    this.screen.key(["escape", "q", "C-c"], () => {
      clearInterval(timer);
      process.exit(0);
    });
  }
}

new PingAutomation();
