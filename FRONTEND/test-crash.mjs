import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`[Console Error] ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        errors.push(`[Page Error] ${err.message}`);
    });

    try {
        await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000); // give React time to crash
        if (errors.length > 0) {
            console.log('---ERRORS CAUGHT---');
            console.log(errors.join('\n'));
        } else {
            console.log('No obvious errors caught.');
        }
    } catch (e) {
        console.log('Script error:', e);
    } finally {
        await browser.close();
    }
})();
