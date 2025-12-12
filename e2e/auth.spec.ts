/**
 * Authentication E2E Tests
 * 
 * End-to-end tests for authentication flows.
 * 
 * Built by Carphatian
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')
      
      await expect(page.getByRole('heading', { name: /Sign In|Log In|Welcome/i })).toBeVisible()
      await expect(page.getByPlaceholder(/email/i)).toBeVisible()
      await expect(page.getByPlaceholder(/password/i)).toBeVisible()
    })

    test('should have link to sign up', async ({ page }) => {
      await page.goto('/login')
      
      await expect(page.getByRole('link', { name: /sign up|create account|register/i })).toBeVisible()
    })

    test('should show validation errors on empty submit', async ({ page }) => {
      await page.goto('/login')
      
      // Try to submit empty form
      await page.getByRole('button', { name: /sign in|log in/i }).click()
      
      // Should show validation errors or stay on login page
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Signup Page', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup')
      
      await expect(page.getByRole('heading', { name: /Sign Up|Create Account|Get Started/i })).toBeVisible()
    })

    test('should have role selection', async ({ page }) => {
      await page.goto('/signup')
      
      // Should have options for client or freelancer
      const pageContent = await page.textContent('body')
      expect(pageContent).toMatch(/client|freelancer|hire|work/i)
    })

    test('should have link to login', async ({ page }) => {
      await page.goto('/signup')
      
      await expect(page.getByRole('link', { name: /sign in|log in|already have/i })).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing client dashboard', async ({ page }) => {
      await page.goto('/client')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect to login when accessing freelancer dashboard', async ({ page }) => {
      await page.goto('/freelancer')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect to login when accessing admin dashboard', async ({ page }) => {
      await page.goto('/admin')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })
  })
})
