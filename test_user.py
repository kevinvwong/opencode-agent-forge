from playwright.sync_api import sync_playwright
import os
import sys

BASE = "http://localhost:5173/opencode-agent-forge"
OUT = os.path.join(os.path.dirname(__file__), "test_output")
os.makedirs(OUT, exist_ok=True)

def screenshot(page, name):
    path = os.path.join(OUT, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  Screenshot: {name}.png")

def check(page, selector, desc):
    count = page.locator(selector).count()
    status = "PASS" if count > 0 else "FAIL"
    print(f"  [{status}] {desc} ({selector}) — found {count}")
    return count > 0

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        print("=== 1. DASHBOARD ===")
        page.goto(f"{BASE}/")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)
        screenshot(page, "01-dashboard")
        check(page, "text=Agent Forge", "Dashboard heading")
        check(page, "text=Party Size", "Campaign stat: Party Size")
        check(page, "text=Avg Level", "Campaign stat: Avg Level")
        check(page, "text=Templates", "Templates section heading")

        print("\n=== 2. AGENT CARDS VISIBLE ===")
        cards = page.locator('[class*="sheet-panel"]')
        print(f"  Agent cards found: {cards.count()}")

        print("\n=== 3. NAVIGATION: LIBRARY ===")
        page.click("text=Library")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(800)
        screenshot(page, "02-library")
        check(page, "text=Agent Library", "Library heading")
        check(page, "text=Import .md", "Import button present")
        check(page, "text=Export", "Export button present")
        check(page, "text=+ New Agent", "New Agent button present")

        print("\n=== 4. SEARCH FILTER ===")
        search_input = page.locator('input[placeholder="Search name, tags, model..."]')
        if search_input.count() > 0:
            search_input.fill("design")
            page.wait_for_timeout(500)
            screenshot(page, "03-library-search-design")
            check(page, "text=Templates", "Search results for 'design'")
            search_input.fill("")
            page.wait_for_timeout(300)

        print("\n=== 5. CLASS FILTER ===")
        select = page.locator("select").first
        if select.count() > 0:
            select.select_option("primary")
            page.wait_for_timeout(500)
            screenshot(page, "04-library-filter-fighter")
            select.select_option("all")
            page.wait_for_timeout(300)

        print("\n=== 6. LIST VIEW TOGGLE ===")
        list_btn = page.locator("button:has-text('☰')")
        if list_btn.count() > 0:
            list_btn.click()
            page.wait_for_timeout(500)
            screenshot(page, "05-library-list-view")

        grid_btn = page.locator("button:has-text('▦')")
        if grid_btn.count() > 0:
            grid_btn.click()
            page.wait_for_timeout(300)

        print("\n=== 7. GROUP BY CLASS ===")
        group_checkbox = page.locator('input[type="checkbox"]')
        if group_checkbox.count() > 0:
            group_checkbox.check()
            page.wait_for_timeout(500)
            screenshot(page, "06-library-grouped")
            group_checkbox.uncheck()

        print("\n=== 8. NAVIGATION: EDITOR (NEW) ===")
        page.click("text=+ New Agent")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(800)
        screenshot(page, "07-editor-new")
        check(page, "text=Create Agent", "Editor heading for new agent")
        check(page, "text=Ability Scores", "Ability Scores section")
        check(page, "text=Skill Proficiencies", "Skill Proficiencies section")

        print("\n=== 9. EDITOR TABS ===")
        for tab in ["Permissions", "Prompt", "Advanced"]:
            tab_btn = page.locator(f"button:has-text('{tab}')")
            if tab_btn.count() > 0:
                tab_btn.first.click()
                page.wait_for_timeout(300)
                screenshot(page, f"08-editor-tab-{tab.lower()}")
                print(f"  Tab '{tab}' — OK")

        print("\n=== 10. RETURN TO DASHBOARD ===")
        page.click("text=Dashboard")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        screenshot(page, "09-dashboard-final")
        check(page, "text=Agent Forge", "Back on Dashboard")

        print("\n=== 11. RESPONSIVE: MOBILE VIEWPORT ===")
        mobile = browser.new_context(viewport={"width": 375, "height": 812})
        m_page = mobile.new_page()
        m_page.goto(f"{BASE}/")
        m_page.wait_for_load_state("networkidle")
        m_page.wait_for_timeout(1000)
        m_page.screenshot(path=os.path.join(OUT, "10-mobile-dashboard.png"), full_page=True)
        print("  Screenshot: 10-mobile-dashboard.png")
        check(m_page, "text=Agent Forge", "Mobile: Dashboard heading")
        m_page.click("text=Library")
        m_page.wait_for_load_state("networkidle")
        m_page.wait_for_timeout(500)
        m_page.screenshot(path=os.path.join(OUT, "11-mobile-library.png"), full_page=True)
        print("  Screenshot: 11-mobile-library.png")
        mobile.close()

        print(f"\n{'='*50}")
        print(f"All tests complete. Screenshots in: {OUT}")
        print(f"{'='*50}")

        browser.close()

if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        print(f"FATAL: {e}", file=sys.stderr)
        sys.exit(1)
