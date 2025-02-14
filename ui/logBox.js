class LogBox {
  constructor(grid, screen) {
    this.logBox = grid.set(4, 0, 4, 12, require("blessed").log, {
      fg: "green",
      selectedFg: "green",
      label: "Logs",
      scrollable: true,
      mouse: true,
      scrollbar: {
        ch: " ",
        bg: "blue",
      },
    });
    this.screen = screen;
  }

  log(message) {
    this.logBox.log(message);
    this.screen.render();
  }
}

module.exports = LogBox;
