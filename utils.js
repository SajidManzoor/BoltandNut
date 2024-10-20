import { expect } from "@playwright/test";

export class Utils {
  constructor(page) {
    this.page = page;
    this.category = page.getByRole("tab", { name: "Category " });
    this.categoryItems = page.locator(".am-filter-items-category_ids");
    this.product = page.locator(".product-item-info").first();
    this.viewPricingButton = this.product.getByRole("button", {
      name: "View Volume Pricing",
    });
    this.viewPricingPopup = page.locator("//div[@class='ajax-tier active']");
    this.increaseQuantityButton = page
      .locator("//*[@class='quantity-controls quantity-plus']")
      .first();
    this.decreaseQuantityButton = page
      .locator("//*[@class='quantity-controls quantity-minus']")
      .first();
    this.quantity = page.locator("[name='qty']").first();
    this.header = page.locator(".dz-head-notice");
    this.discountAppliedText = this.product.locator(".dz_spend_disc_note");
    this.totalPriceText = page.locator('//*[@class="dz_qty_note"]').first();
  }

  async selectCategory(category) {
    await this.category.click();
    await this.categoryItems.getByText(category).click();
    await this.page.waitForLoadState("networkidle");
  }
  async verifyCategory(category) {
    await expect(
      await this.page
        .getByRole("link", { name: category, exact: true })
        .first()
        .locator("../../../..")
    ).toHaveClass(/active/);
  }
  async clickCategoryCard(category) {
    await this.page
      .getByRole("link", { name: category, exact: true })
      .first()
      .locator("../../../..")
      .click();
  }
  async clickViewPricing() {
    await this.viewPricingButton.click();
  }
  async verifyViewPricingPopup() {
    await expect(await this.viewPricingPopup).toBeVisible();
  }
  async closeViewPricingPopup() {
    await this.header.click();
    await expect(await this.viewPricingPopup).not.toBeVisible();
  }
  async increaseQuantity() {
    await this.increaseQuantityButton.click();
  }
  async decreaseQuantity() {
    await this.decreaseQuantityButton.click();
  }
  async setQuantity(qty) {
    await this.quantity.fill(String(qty));
  }
  async verifyQuantity(qty) {
    await expect(await this.quantity).toHaveValue(String(qty));
  }
  async verifyDiscountRanges() {
    await this.clickViewPricing();
    await this.verifyViewPricingPopup();
    var rowCount = await this.viewPricingPopup.getByRole("row").count();
    var pricingData = {};
    const regex = /\d+(\.\d{1,2})?/g;
    for (let i = 1; i < rowCount - 3; i++) {
      var quantity = await this.viewPricingPopup
        .getByRole("row")
        .nth(i)
        .locator("td")
        .nth(0)
        .textContent();
      quantity = quantity.match(regex)[0];
      var pricePerEach = await this.viewPricingPopup
        .getByRole("row")
        .nth(i)
        .locator("td")
        .nth(1)
        .textContent();
      pricePerEach = pricePerEach.match(regex)[0];
      var subTotal = await this.viewPricingPopup
        .getByRole("row")
        .nth(i)
        .locator("td")
        .nth(2)
        .textContent();
      subTotal = subTotal.match(regex)[0];
      pricingData[quantity] = {
        pricePerEach: pricePerEach,
        subTotal: subTotal,
      };
    }
    var discountData = {};
    rowCount = await this.page.locator(".disc-tool").locator("div").count();
    for (let i = 0; i < rowCount; i++) {
      var discountDiv = String(
        await this.page
          .locator(".disc-tool")
          .locator("div")
          .nth(i)
          .textContent()
      ).match(regex);
      var discountPercentage = discountDiv[0];
      var discountUpperLimit = discountDiv[discountDiv.length - 1];
      discountData[discountPercentage] = { discountUpperLimit };
    }
    await this.closeViewPricingPopup();
    for (const [key, value] of Object.entries(pricingData)) {
      await this.setQuantity(key);
      await this.verifyQuantity(key);
      var discountRate;
      var discountedSubTotal;
      var discountedPricePerEach;

      var expectedText;
      if (value.subTotal <= 99) {
        discountRate = 0.05;
        discountedSubTotal = value.subTotal * (1 - discountRate);
        discountedPricePerEach = value.pricePerEach * (1 - discountRate);
        expectedText = ` Total = ${discountedSubTotal.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })} (${discountedPricePerEach.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}/ea)`;

        expect(await this.totalPriceText.innerText()).toEqual(expectedText);
      } else if (value.subTotal > 99 && value <= 249) {
        discountRate = 0.1;
        discountedSubTotal = value.subTotal * (1 - discountRate);
        discountedPricePerEach = value.pricePerEach * (1 - discountRate);
        expectedText = ` Total = ${discountedSubTotal.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })} (${discountedPricePerEach.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}/ea)`;

        expect(await this.totalPriceText.innerText()).toEqual(expectedText);
      } else if (value.subTotal > 249) {
        discountRate = 0.15;
        discountedSubTotal = value.subTotal * (1 - discountRate);
        discountedPricePerEach = value.pricePerEach * (1 - discountRate);
        expectedText = ` Total = ${discountedSubTotal.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })} (${discountedPricePerEach.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}/ea)`;

        expect(await this.totalPriceText.innerText()).toEqual(expectedText);
      }
    }
  }
}
