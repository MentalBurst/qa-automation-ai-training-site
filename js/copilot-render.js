/**
 * copilot-render.js
 * Renders the GitHub Copilot Prompt section at the bottom of each QA Lab page.
 * Reads prompt data from window.QALabPrompts (copilot-prompts.js).
 */

(function () {
  'use strict';

  const FRAMEWORKS = [
    { id: 'playwright-ts', label: 'Playwright (TypeScript)' },
    { id: 'playwright-py', label: 'Playwright (Python)' },
    { id: 'selenium-py',   label: 'Selenium (Python)' },
    { id: 'selenium-java', label: 'Selenium (Java)' },
    { id: 'cypress',       label: 'Cypress (JavaScript)' },
    { id: 'robot',         label: 'Robot Framework' },
    { id: 'webdriverio',   label: 'WebdriverIO (TypeScript)' },
  ];

  /* ── selectors helper ────────────────────────────────────── */
  function getByTestIdSnippet(fw, testid, type, desc) {
    const map = {
      'playwright-ts':  `page.getByTestId('${testid}')   // ${type}: ${desc}`,
      'playwright-py':  `page.get_by_test_id('${testid}')  # ${type}: ${desc}`,
      'selenium-py':    `driver.find_element(By.CSS_SELECTOR, '[data-testid="${testid}"]')  # ${type}: ${desc}`,
      'selenium-java':  `driver.findElement(By.cssSelector("[data-testid=\\"${testid}\\"]"));  // ${type}: ${desc}`,
      'cypress':        `cy.get('[data-testid="${testid}"]')   // ${type}: ${desc}`,
      'robot':          `CSS:[data-testid="${testid}"]   # ${type}: ${desc}`,
      'webdriverio':    `$('[data-testid="${testid}"]')   // ${type}: ${desc}`,
    };
    return map[fw] || map['playwright-ts'];
  }

  /* ── framework-specific boilerplate ─────────────────────── */
  function frameworkImport(fw, url) {
    const baseUrl = `http://localhost:8080/${url}`;
    const map = {
      'playwright-ts': `import { test, expect } from '@playwright/test';
const PAGE_URL = '${baseUrl}';`,
      'playwright-py': `import pytest
from playwright.sync_api import Page, expect
PAGE_URL = '${baseUrl}'`,
      'selenium-py':  `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
PAGE_URL = '${baseUrl}'`,
      'selenium-java': `import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import static org.junit.Assert.*;
// PAGE_URL = "${baseUrl}"`,
      'cypress':       `// cypress/e2e/scenario.cy.js
const PAGE_URL = '${baseUrl}';`,
      'robot':         `*** Settings ***
Library    SeleniumLibrary
# OR Library    Browser   (Playwright)
Suite Setup    Open Browser    ${baseUrl}    chrome`,
      'webdriverio':   `// wdio.conf.js should point baseUrl to http://localhost:8080
// spec file:
describe('QA Lab Test', () => {`,
    };
    return map[fw] || map['playwright-ts'];
  }

  /* ── navigate snippet ─────────────────────────────────────── */
  function navigateTo(fw, url) {
    const map = {
      'playwright-ts':  `await page.goto(PAGE_URL);`,
      'playwright-py':  `page.goto(PAGE_URL)`,
      'selenium-py':    `driver.get(PAGE_URL)`,
      'selenium-java':  `driver.get(PAGE_URL);`,
      'cypress':        `cy.visit(PAGE_URL);`,
      'robot':          `Go To    ${url}`,
      'webdriverio':    `await browser.url(PAGE_URL);`,
    };
    return map[fw] || map['playwright-ts'];
  }

  /* ── generate full markdown prompt ──────────────────────── */
  function buildPrompt(data, fw) {
    const fwLabel = FRAMEWORKS.find(f => f.id === fw)?.label || fw;
    const elements = data.elements || [];
    const scenarios = data.scenarios || [];
    const credential = (data.credentials || [])[0];

    let md = '';
    md += `# GitHub Copilot Prompt\n`;
    md += `## Generate tests for: ${data.title}\n\n`;
    md += `**Framework:** ${fwLabel}  \n`;
    md += `**Difficulty:** ${data.difficulty}  \n`;
    md += `**Page URL:** \`http://localhost:8080/${data.url}\`\n\n`;
    md += `---\n\n`;
    md += `## Page Description\n${data.description}\n\n`;
    md += `---\n\n`;

    if (elements.length) {
      md += `## Key Selectors (data-testid)\n\n`;
      md += `| Selector | Type | Purpose |\n`;
      md += `|----------|------|---------|\n`;
      elements.forEach(e => {
        md += `| \`${e.testid}\` | ${e.type} | ${e.desc} |\n`;
      });
      md += `\n`;

      md += `### ${fwLabel} Locator Examples\n\n`;
      md += '```\n';
      // navigate
      md += `${navigateTo(fw, data.url)}\n\n`;
      // first 4 elements as quick examples
      elements.slice(0, 5).forEach(e => {
        md += `${getByTestIdSnippet(fw, e.testid, e.type, e.desc)}\n`;
      });
      md += '```\n\n';
    }

    if (credential) {
      md += `## Test Data\n`;
      md += `- Valid username: \`${credential.user}\`\n`;
      md += `- Valid password: \`${credential.pass}\`\n`;
      if (data.takenUsernames) {
        md += `- Taken usernames: ${data.takenUsernames.map(u => `\`${u}\``).join(', ')}\n`;
      }
      if (data.credentials && data.credentials.length > 1) {
        data.credentials.slice(1).forEach(c => {
          md += `- Additional: \`${c.user}\` / \`${c.pass}\`\n`;
        });
      }
      md += `\n`;
    }

    md += `---\n\n`;
    md += `## Test Scenarios\n\n`;

    scenarios.forEach(s => {
      md += `### ${s.id}: ${s.name}\n\n`;
      if (fw === 'robot') {
        md += `\`\`\`robot\n`;
        md += `${s.id} ${s.name}\n`;
        s.steps.forEach((step, i) => {
          md += `    # ${i + 1}. ${step}\n`;
        });
        md += `\`\`\`\n\n`;
      } else if (fw === 'playwright-ts' || fw === 'playwright-py' || fw === 'webdriverio') {
        const asyncKw = fw === 'playwright-py' ? '' : 'async ';
        const awaitKw = fw === 'playwright-py' ? '' : 'await ';
        md += `\`\`\`\n`;
        md += `// ${s.name}\n`;
        s.steps.forEach((step, i) => {
          md += `// Step ${i + 1}: ${step}\n`;
        });
        md += `\`\`\`\n\n`;
      } else {
        md += `\`\`\`\n`;
        md += `// ${s.name}\n`;
        s.steps.forEach((step, i) => {
          md += `// Step ${i + 1}: ${step}\n`;
        });
        md += `\`\`\`\n\n`;
      }
    });

    if (data.pitfalls && data.pitfalls.length) {
      md += `---\n\n## Automation Pitfalls\n\n`;
      data.pitfalls.forEach(p => { md += `- ${p}\n`; });
      md += `\n`;
    }

    if (data.innerElements) {
      md += `---\n\n## Inner Elements (Frames / Shadow DOM)\n\n`;
      Object.entries(data.innerElements).forEach(([context, elems]) => {
        md += `### ${context}\n\n`;
        elems.forEach(e => {
          const sel = e.testid ? `data-testid="${e.testid}"` : `id="${e.id}"`;
          md += `- \`${sel}\` — ${e.desc}\n`;
        });
        md += `\n`;
      });
    }

    if (data.zoneMap) {
      md += `---\n\n## Canvas Zone Map\n\n`;
      md += `| Zone | X | Y | Width | Height | Click Center |\n`;
      md += `|------|----|---|-------|--------|-------------|\n`;
      data.zoneMap.forEach(z => {
        md += `| ${z.label} | ${z.x} | ${z.y} | ${z.w} | ${z.h} | { x: ${z.centerX}, y: ${z.centerY} } |\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
    md += `## Copilot Instruction\n\n`;
    md += `**Please generate a complete, production-ready test file using ${fwLabel}.**\n\n`;
    md += `Requirements:\n`;
    md += `- Use \`data-testid\` attributes as the primary selector strategy\n`;
    md += `- Implement ALL ${scenarios.length} test scenarios listed above\n`;
    md += `- Include proper waiting strategies — no fixed sleep/timeout\n`;
    md += `- Add descriptive test names and comments\n`;
    md += `- Handle dynamic content with appropriate waitFor patterns\n`;
    md += `- Include beforeEach/setUp/teardown as needed\n`;
    md += `- Follow ${fwLabel} best practices and conventions\n`;

    if (fw === 'playwright-ts') {
      md += `- Use async/await throughout\n`;
      md += `- Use expect(locator).toBeVisible(), toHaveText(), toHaveValue(), toHaveAttribute()\n`;
    } else if (fw === 'playwright-py') {
      md += `- Use expect(locator).to_be_visible(), to_have_text(), to_have_value()\n`;
    } else if (fw === 'selenium-py') {
      md += `- Use WebDriverWait with expected_conditions\n`;
      md += `- Use Select() for dropdown interactions\n`;
    } else if (fw === 'cypress') {
      md += `- Use cy.get(), cy.contains(), cy.should() chains\n`;
      md += `- Handle dialogs with cy.on("window:confirm")\n`;
    } else if (fw === 'robot') {
      md += `- Use SeleniumLibrary or Browser keywords\n`;
      md += `- Write in keyword-driven style\n`;
    }

    md += `\n_Page: ${data.url} | QA Lab v1.0.0_\n`;

    return md;
  }

  /* ── render section ───────────────────────────────────────── */
  function render(mount, data) {
    let selectedFw = 'playwright-ts';

    mount.innerHTML = `
      <div class="copilot-section" id="copilot-section" data-testid="copilot-section">
        <div class="copilot-header">
          <div class="copilot-title">
            <span class="copilot-icon">🟣</span>
            <span>GitHub Copilot Prompt</span>
          </div>
          <p class="copilot-subtitle">
            Select your target framework, then copy the markdown below and paste it into GitHub Copilot Chat
            to generate a ready-to-run test file for this scenario.
          </p>
        </div>

        <div class="copilot-controls">
          <label class="form-label" for="copilot-fw-select" style="margin-bottom:0;">Framework:</label>
          <select class="form-select copilot-fw-select" id="copilot-fw-select" data-testid="copilot-fw-select" style="width:auto;">
            ${FRAMEWORKS.map(f => `<option value="${f.id}">${f.label}</option>`).join('\n            ')}
          </select>
          <button class="btn btn-primary btn-sm copilot-copy-btn" id="copilot-copy-btn" data-testid="copilot-copy-btn">
            Copy Prompt
          </button>
          <span class="copilot-copied-msg" id="copilot-copied-msg" data-testid="copilot-copied-msg" style="display:none;">
            🟢 Copied!
          </span>
        </div>

        <textarea
          class="copilot-textarea"
          id="copilot-textarea"
          data-testid="copilot-textarea"
          readonly
          spellcheck="false"
          aria-label="GitHub Copilot prompt markdown"
        ></textarea>

        <div class="copilot-footer">
          <span>
            🔵 Tip: In VS Code, open Copilot Chat (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd>),
            paste this prompt and press Enter. Copilot will generate the complete test file.
          </span>
        </div>
      </div>
    `;

    const textarea = mount.querySelector('#copilot-textarea');
    const fwSelect = mount.querySelector('#copilot-fw-select');
    const copyBtn  = mount.querySelector('#copilot-copy-btn');
    const copiedMsg= mount.querySelector('#copilot-copied-msg');

    function refresh() {
      selectedFw = fwSelect.value;
      textarea.value = buildPrompt(data, selectedFw);
    }

    fwSelect.addEventListener('change', refresh);

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(textarea.value).then(() => {
        copiedMsg.style.display = 'inline';
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copiedMsg.style.display = 'none';
          copyBtn.textContent = 'Copy Prompt';
        }, 2500);
      }).catch(() => {
        // Fallback for older browsers
        textarea.select();
        document.execCommand('copy');
        copiedMsg.style.display = 'inline';
        setTimeout(() => { copiedMsg.style.display = 'none'; }, 2500);
      });
    });

    refresh();
  }

  /* ── auto-init ────────────────────────────────────────────── */
  function init() {
    const mount = document.getElementById('copilot-prompt-mount');
    if (!mount) return;

    const prompts = window.QALabPrompts;
    if (!prompts) {
      console.warn('[copilot-render] QALabPrompts not loaded.');
      return;
    }

    // Detect current page by filename
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const data = prompts[page];
    if (!data) {
      console.warn(`[copilot-render] No prompt data for: ${page}`);
      return;
    }

    render(mount, data);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

