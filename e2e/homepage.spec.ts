/**
 * Homepage E2E Tests
 * 
 * End-to-end tests for the homepage.
 * 
 * Built by Carphatian
 */

import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle(/Carphatian AI Marketplace/)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Perfect Talent')
  })

  test('should have navigation links', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByRole('link', { name: 'How It Works' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Find Talent' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Find Work' })).toBeVisible()
  })

  test('should have sign in and get started buttons', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible()
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: 'Get Started' }).click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('Why Choose Carphatian?')).toBeVisible()
    await expect(page.getByText('Instant Matching')).toBeVisible()
    await expect(page.getByText('Secure Payments')).toBeVisible()
    await expect(page.getByText('AI Assistant')).toBeVisible()
  })

  test('should display how it works section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('How It Works')).toBeVisible()
    await expect(page.getByText('Describe Your Needs')).toBeVisible()
    await expect(page.getByText('Get Matched Instantly')).toBeVisible()
    await expect(page.getByText('Hire & Pay Securely')).toBeVisible()
  })

  test('should display footer', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.getByText('Terms of Service')).toBeVisible()
    await expect(page.getByText('Privacy Policy')).toBeVisible()
  })
})
