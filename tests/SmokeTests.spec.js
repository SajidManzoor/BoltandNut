import { test, expect } from "@playwright/test";
import { Utils } from "../utils";

test.describe.configure({ mode: "serial" });

let page;
let utils;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  utils = new Utils(page);
});

test.skip("Subcategory Filter", async () => {
  await page.goto("/allthread");
  await page.getByRole("tab", { name: "Category " }).click();
  await page.getByRole("tabpanel").getByText("Metric Fine").click();
  expect(await page.url()).toContain("cat");
  await expect(await page.locator("#dz-sub-cat-1149").first()).not.toHaveClass(
    /active/
  );
  await expect(
    await page.getByRole("link", { name: "Metric Fine", exact: true }).first()
  ).toBeEnabled();
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
});
test("Discount Check",async ()=>{
  await utils.verifyDiscountRanges()
})

