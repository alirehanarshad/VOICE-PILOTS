"""
Browser Tool — provides web browsing capabilities using Playwright.
"""
import asyncio
from playwright.async_api import async_playwright

class BrowserTool:
    """
    Handles browser automation tasks.
    """
    
    _instance = None
    _browser = None
    _context = None
    _playwright = None

    @classmethod
    async def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def _ensure_browser(self):
        if self._browser is None:
            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.chromium.launch(headless=True)
            self._context = await self._browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        return self._context

    async def search(self, query: str) -> str:
        """Search the web for a query."""
        context = await self._ensure_browser()
        page = await context.new_page()
        try:
            # Simple Google search implementation
            await page.goto(f"https://www.google.com/search?q={query}")
            await page.wait_for_load_state("networkidle")
            
            # Extract main search result snippets
            results = await page.eval_on_selector_all(
                "div.g", 
                "nodes => nodes.slice(0, 3).map(n => n.innerText).join('\\n\\n')"
            )
            return results if results else "No results found."
        except Exception as e:
            return f"Search error: {str(e)}"
        finally:
            await page.close()

    async def visit_url(self, url: str) -> str:
        """Visit a specific URL and extract text."""
        context = await self._ensure_browser()
        page = await context.new_page()
        try:
            await page.goto(url)
            await page.wait_for_load_state("networkidle")
            text = await page.inner_text("body")
            return text[:2000] # Return first 2k chars
        except Exception as e:
            return f"Navigation error: {str(e)}"
        finally:
            await page.close()

    async def close(self):
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()

# Tool Handler Wrapper
async def browser_search(query: str):
    bt = await BrowserTool.get_instance()
    return await bt.search(query)

async def browser_visit(url: str):
    bt = await BrowserTool.get_instance()
    return await bt.visit_url(url)
