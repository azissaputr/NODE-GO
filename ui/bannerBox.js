class BannerBox {
  constructor(grid, screen) {
    this.bannerBox = grid.set(0, 0, 1, 12, require("blessed").box, {
      content:
        "{center}{bold}NodeGo BOT{/bold}{/center}\n{center}Codeberg: https://codeberg.org/Galkurta | Telegram: https://t.me/galkurtarchive{/center}",
      tags: true,
      style: {
        fg: "green",
      },
    });
    this.screen = screen;
  }
}

module.exports = BannerBox;
