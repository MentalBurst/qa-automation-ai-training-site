# QA Lab Testing Guide

A framework-by-framework guide to automating the 20 QA Lab scenarios.

---

## Playwright (TypeScript) Quick Start

```typescript
import { test, expect } from '@playwright/test';

// Scenario 01 Login
test('login with valid credentials', async ({ page }) => {
  await page.goto('http://localhost:8080/pages/01-simple-login.html');
  await page.getByTestId('input-username').fill('admin');
  await page.getByTestId('input-password').fill('admin123');
  await page.getByTestId('btn-submit').click();
  await expect(page.getByTestId('login-success')).toBeVisible();
  await expect(page.getByTestId('success-username')).toContainText('admin');
});

// Scenario 06 Sort table
test('sort table by name ascending', async ({ page }) => {
  await page.goto('http://localhost:8080/pages/06-dynamic-table.html');
  await page.getByTestId('th-name').click();
  await expect(page.getByTestId('th-name')).toHaveAttribute('aria-sort', 'ascending');
});

// Scenario 12 Wait for async content
test('wait for spinner to disappear', async ({ page }) => {
  await page.goto('http://localhost:8080/pages/12-async-loading.html');
  await page.getByTestId('btn-load-data').click();
  await expect(page.getByTestId('loading-spinner-area')).toBeVisible();
  await expect(page.getByTestId('loaded-content')).toBeVisible({ timeout: 5000 });
});

// Scenario 15 LocalStorage
test('cart persists after reload', async ({ page }) => {
  await page.goto('http://localhost:8080/pages/15-localstorage-state.html');
  await page.getByTestId('btn-add-playwright').click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
  await page.reload();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
});

// Scenario 16 iFrames
test('interact within nested iframe', async ({ page }) => {
  await page.goto('http://localhost:8080/pages/16-nested-iframes.html');
  const frameA = page.frameLocator('#iframe-a');
  await frameA.locator('#frame-a-input').fill('Test value');
  await frameA.locator('#btn-frame-a-submit').click();
  await expect(frameA.locator('#frame-a-result')).toContainText('Test value');

  // Nested
  const frameB = frameA.frameLocator('#iframe-b');
  await frameB.locator('#frame-b-input').fill('Deep nested!');
  await frameB.locator('#btn-frame-b-submit').click();
  await expect(frameB.locator('#frame-b-result')).toContainText('Deep nested!');
});

// Scenario 17 Shadow DOM (Playwright auto-pierces open shadow)
test('interact with shadow DOM login', async ({ page }) => {
  await page.goto('http://localhost:8080/pages/17-shadow-dom.html');
  const shadowLogin = page.locator('qa-login');
  await shadowLogin.locator('[data-testid="shadow-input-email"]').fill('test@test.com');
  await shadowLogin.locator('[data-testid="shadow-input-password"]').fill('password');
  await shadowLogin.locator('[data-testid="shadow-btn-submit"]').click();
  await expect(page.getByTestId('shadow-login-result')).toBeVisible();
});

// Scenario 20 Accessibility by role
test('query by ARIA role', async ({ page }) => {
  await page.goto('http://localhost:8080/pages/20-accessibility.html');
  await page.getByRole('button', { name: 'Toggle Details' }).click();
  await expect(page.getByRole('button', { name: 'Toggle Details' }))
    .toHaveAttribute('aria-expanded', 'true');
});
```

---

## Selenium (Python) Key Patterns

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

# Login (01)
driver.get("http://localhost:8080/pages/01-simple-login.html")
driver.find_element(By.CSS_SELECTOR, '[data-testid="input-username"]').send_keys("admin")
driver.find_element(By.CSS_SELECTOR, '[data-testid="input-password"]').send_keys("admin123")
driver.find_element(By.CSS_SELECTOR, '[data-testid="btn-submit"]').click()
wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-success"]')))

# Native select (04)
select = Select(driver.find_element(By.ID, "select-country"))
select.select_by_value("pt")

# iFrame (16) Selenium switchTo
driver.switch_to.frame("frame-a")
driver.find_element(By.ID, "frame-a-input").send_keys("Selenium test")
driver.find_element(By.ID, "btn-frame-a-submit").click()
driver.switch_to.default_content()

# Shadow DOM (17) via JavaScript
host = driver.find_element(By.CSS_SELECTOR, "qa-login")
shadow = driver.execute_script("return arguments[0].shadowRoot", host)
shadow.find_element(By.ID, "shadow-email").send_keys("test@test.com")

# LocalStorage (15)
driver.execute_script("localStorage.clear();")
value = driver.execute_script("return localStorage.getItem('qalab_cart');")
```

---

## Cypress (JavaScript) Key Patterns

```javascript
// Login (01)
cy.visit('/pages/01-simple-login.html');
cy.get('[data-testid="input-username"]').type('admin');
cy.get('[data-testid="input-password"]').type('admin123');
cy.get('[data-testid="btn-submit"]').click();
cy.get('[data-testid="login-success"]').should('be.visible');

// iFrames (16) requires cypress-iframe plugin
cy.frameLoaded('#iframe-a');
cy.iframe('#iframe-a').find('#frame-a-input').type('Cypress test');

// LocalStorage (15)
cy.clearLocalStorage();
cy.window().then(win => {
  const val = win.localStorage.getItem('qalab_cart');
  expect(JSON.parse(val)).to.have.length(0);
});

// Async wait (12)
cy.get('[data-testid="btn-load-data"]').click();
cy.get('[data-testid="loaded-content"]', { timeout: 5000 }).should('be.visible');
```

---

## Robot Framework Key Patterns

```robot
*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}    http://localhost:8080

*** Test Cases ***
Login With Valid Credentials
    Open Browser    ${URL}/pages/01-simple-login.html    chrome
    Input Text      css:[data-testid="input-username"]    admin
    Input Text      css:[data-testid="input-password"]    admin123
    Click Button    css:[data-testid="btn-submit"]
    Wait Until Element Is Visible    css:[data-testid="login-success"]
    Close Browser

Sort Table By Name
    Open Browser    ${URL}/pages/06-dynamic-table.html    chrome
    Click Element    css:[data-testid="th-name"]
    Element Should Have Attribute    css:[data-testid="th-name"]    aria-sort    ascending
```

---

## Common Locator Strategies

All pages follow this selector priority:

1. `data-testid` **Primary** stable, framework-agnostic
2. `id` Stable if not dynamically generated (see scenario 18!)
3. ARIA roles via `getByRole()` Best for accessibility testing
4. Text content via `getByText()` For visible labels
5. CSS selectors Only when 1-4 not available
6. XPath **Last resort only**

---

## Data-TestId Convention

```
Pattern:  data-testid="[noun]-[descriptor]"
Examples: btn-submit, input-username, error-email, 
          table-search, modal-confirm, card-01
```

---

*QA Lab Testing Guide Version 1.0.0 2026-05-15*

