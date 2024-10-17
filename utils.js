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
    this.totalPriceText=page.locator('//*[@class="dz_qty_note"]').first()
  
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
    await expect(this.viewPricingPopup).toBeVisible();
  }
  async closeViewPricingPopup() {
    await this.header.click();
    await expect(this.viewPricingPopup).not.toBeVisible();

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
    var pricingData={}
    // const regex=/\d+(\.\d+)?/
    const regex=/\d+(\.\d+)?/g;
    for (let i = 1; i < rowCount-3; i++) {
      var quantity=await this.viewPricingPopup.getByRole('row').nth(i).locator('td').nth(0).textContent();
      // const regex = /\d+/;
      quantity= quantity.match(regex)[0];  
      var pricePerEach=await this.viewPricingPopup.getByRole('row').nth(i).locator('td').nth(1).textContent();
      pricePerEach= pricePerEach.match(regex)[0];
      var subTotal=await this.viewPricingPopup.getByRole('row').nth(i).locator('td').nth(2).textContent();
      subTotal= subTotal.match(regex)[0];
      pricingData[quantity]={'pricePerEach':pricePerEach,'subTotal':subTotal}
    }
    console.log(pricingData)
    var discountData={}
    rowCount=await this.page.locator(".disc-tool").locator('div').count()
    console.log('rowCount',rowCount)
    for(let i=0;i<rowCount;i++){
      var discountDiv=String(await this.page.locator('.disc-tool').locator('div').nth(i).textContent()).match(regex)
      var discountPercentage=discountDiv[0]
      var discountUpperLimit=discountDiv[discountDiv.length-1]
      discountData[discountPercentage]={discountUpperLimit}
    }
    console.log(discountData)
   await this.closeViewPricingPopup();

  //  const lessthan99 = [];
  //   const lessthan249=[];
  //   const greaterthan249=[];
  // for (const obj of pricingData) {
  //   const key = Object.keys(obj)[0]; // Get the key (e.g., "1", "2", etc.)
  //   const subtotal = obj[key].subTotal; // Access the subtotal

  //   if (subtotal <= 99) {
  //     lessthan99.push(key); // Add the key to the array if subtotal is greater than 99
  //   }
  //   else if (subtotal >=100 && subtotal<=249)
  //   {  lessthan249.push(key)
  //   }
  //   else{
  //     greaterthan249.push(key)
  //   }
    
  // }

  for (var i=0;i<Object.keys(pricingData).length;i++)
    {
      console.log('Quantity',Object.keys(pricingData)[i])
      // console.log(String(pricingData[Object.keys(pricingData)[i]].pricePerEach))
      await this.setQuantity(Object.keys(pricingData)[i])
      await this.verifyQuantity(Object.keys(pricingData)[i])
      if(Object.keys(pricingData)[i].subTotal<=99)
      {
      await expect(await this.totalPriceText.innerText()).toEqual(" Total = /$/"+String(pricingData[Object.keys(pricingData)[i]].subTotal-((pricingData[Object.keys(pricingData)[i]].subTotal)*0.05))+" ($"+String(pricingData[Object.keys(pricingData)[i]].pricePerEach)+"/ea)")
      }
    }

   
   
  }
}

