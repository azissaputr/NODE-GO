const CONFIG = require("../config/config");

class Dashboard {
  constructor(grid, screen) {
    this.dashboard = grid.set(1, 0, 3, 12, require("blessed-contrib").table, {
      keys: true,
      fg: "white",
      selectedFg: "white",
      selectedBg: "blue",
      interactive: false,
      label: "Account Status",
      columnSpacing: 3,
      columnWidth: CONFIG.UI.TABLE.COLUMN_WIDTH,
    });
    this.screen = screen;
  }

  update(accounts) {
    const data = accounts.map((account) => [
      account.username || "Loading...",
      account.status,
      account.lastPing,
      account.uptime,
      account.points,
    ]);

    this.dashboard.setData({
      headers: ["Username", "Status", "Last Ping", "Uptime", "Points"],
      data: data,
    });

    this.screen.render();
  }
}

module.exports = Dashboard;
