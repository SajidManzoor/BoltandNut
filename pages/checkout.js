import { expect } from "playwright/test";

export class Checkout {
    constructor(page) {
        this.page = page;
        this.firstName_textbox = page.getByLabel('First Name')
        this.lastName_textbox = page.getByLabel('Last Name')
        this.phone_textbox = page.getByLabel('Mobile Phone (without country')
        this.confirmOrder_button = page.getByRole('button', { name: 'Confirm order' })
        this.stripePayment_button = page.getByRole('button', { name: 'Continue Stripe Payment' });
        this.stripe = {
            cardNumber_textbox: page.locator('#cardNumber'),
            cardExpiry_textbox: page.locator('#cardExpiry'),
            cardCVC_textbox: page.locator('#cardCvc'),
            billingName_textbox: page.locator('#billingName'),
            billingZipCode_textbox: page.locator('#billingPostalCode'),
            billingCountry_dropdown: page.locator('#billingCountry'),
            saveCard_button: page.locator('.SubmitButton-IconContainer'),
        }
    }

    async verifyCheckoutPage() {
        await expect(this.page.url()).toContain('checkout');
        await expect(this.firstName_textbox).toBeVisible();
        await expect(this.lastName_textbox).toBeVisible();
        await expect(this.phone_textbox).toBeVisible();
        await expect(this.confirmOrder_button).toBeVisible();
    }

    async fillDetails(firstName, lastName, phone) {
        await this.firstName_textbox.fill(String(firstName));
        await this.lastName_textbox.fill(String(lastName));
        await this.phone_textbox.fill(String(phone));
    }

    async confirmOrder() {
        await this.page.waitForLoadState()
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
        await this.confirmOrder_button.click({ timeout: 15000 });
    }

    async fillStripeDetails(cardNumber, cardExpiry, cardCVC, billingName, country, zipCode) {
        await expect.soft(await this.stripe.saveCard_button).toBeVisible({ timeout: 60000 })
        if (await this.stripe.cardNumber_textbox.count() > 0) {
            await this.stripe.cardNumber_textbox.fill(String(cardNumber));
            await this.stripe.cardExpiry_textbox.fill(String(cardExpiry));
            await this.stripe.cardCVC_textbox.fill(String(cardCVC));
            await this.stripe.billingCountry_dropdown.selectOption(country);
            await expect(await this.stripe.billingZipCode_textbox).toBeVisible(10000)
            await this.stripe.billingZipCode_textbox.fill(String(zipCode));
            await this.stripe.billingName_textbox.fill(String(billingName));
        }
        await this.stripe.saveCard_button.click();
        await this.page.waitForLoadState()
        await this.page.waitForLoadState('domcontentloaded')
        await this.page.waitForLoadState('networkidle')
        await expect.soft(this.page.url()).toContain('handel')
    }
}