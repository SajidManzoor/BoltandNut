import { test, expect } from "@playwright/test";
import { Utils } from "../utils";

test.describe.configure({ mode: "serial" });

let page;
let utils;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  utils = new Utils(page);
});


test("SubCategory Filter-POM", async () => {
  await page.goto("/allthread");
  await utils.selectCategory("Metric Fine");
  expect(await page.url()).toContain("cat");
  utils.verifyCategory("Metric Fine");
});
test("View Pricing", async () => {
  await utils.clickCategoryCard("Metric Fine");
  await utils.clickViewPricing();
  await utils.verifyViewPricingPopup();
  await utils.closeViewPricingPopup();
});
test("Change Quantity", async () => {
  await utils.increaseQuantity();
  await utils.increaseQuantity();
  await utils.increaseQuantity();
  await utils.increaseQuantity();
  await utils.increaseQuantity();
  await utils.verifyQuantity(6);
  await utils.decreaseQuantity();
  await utils.verifyQuantity(5);
  await utils.setQuantity(1);
  await utils.verifyQuantity(1);
});
test("Discount Check",async ()=>{
  await utils.verifyDiscountRanges()
})
