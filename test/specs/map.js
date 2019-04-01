const { Builder, By, Key, until } = require("selenium-webdriver");

let driver;
describe("map", function() {
  this.timeout(30000);
  before(async function() {
    driver = await new Builder().forBrowser("firefox").build();
    await driver.get("https://foobert.github.io/gc-map/");
  });

  after(async function() {
    await driver.quit();
  });

  it("should open the map", () => {});
});
