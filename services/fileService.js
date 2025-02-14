const fs = require("fs");

class FileService {
  async loadAccounts(logger) {
    try {
      if (!fs.existsSync("data.txt")) {
        logger.log("Error: data.txt file not found!");
        return [];
      }

      const data = await fs.promises.readFile("data.txt", "utf8");
      if (!data.trim()) {
        logger.log("Error: data.txt is empty!");
        return [];
      }

      const accounts = data
        .split("\n")
        .filter((line) => line.trim())
        .map((token) => ({
          token: token.trim(),
          status: "Initializing",
          lastPing: "-",
          uptime: "0",
          points: "0",
        }));

      logger.log(`Loaded ${accounts.length} accounts`);
      return accounts;
    } catch (error) {
      logger.log(`Error loading accounts: ${error.message}`);
      return [];
    }
  }
}

module.exports = new FileService();
