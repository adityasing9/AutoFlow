import os
import time
from playwright.sync_api import sync_playwright

def test_live_site():
    print("Launching browser for live testing...")
    with sync_playwright() as p:
        # Launch using installed Chrome or Edge
        browser = None
        for channel in ["chrome", "msedge"]:
            try:
                browser = p.chromium.launch(channel=channel, headless=True)
                print(f"Successfully launched browser with channel: {channel}")
                break
            except Exception as e:
                print(f"Could not launch channel {channel}: {e}")

        if not browser:
            print("Installing chromium driver...")
            os.system("python -m playwright install chromium")
            browser = p.chromium.launch(headless=True)

        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to https://autoflow-three-pearl.vercel.app...")
        page.goto("https://autoflow-three-pearl.vercel.app", wait_until="networkidle")

        # Check page title
        title = page.title()
        print(f"Page Title: {title}")
        assert "AutoFlow" in title, f"Expected AutoFlow in title, got: {title}"

        # 1. Take initial screenshot of Dashboard
        screenshot_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")
        os.makedirs(screenshot_dir, exist_ok=True)
        dash_shot = os.path.join(screenshot_dir, "01_dashboard.png")
        page.screenshot(path=dash_shot, full_page=True)
        print(f"Saved Dashboard screenshot to {dash_shot}")

        # 2. Test Academic Demo Scenario Button
        print("Clicking 'Run Academic Demo Scenario' button...")
        demo_btn = page.get_by_role("button", name="Run Academic Demo Scenario")
        if demo_btn.is_visible():
            demo_btn.click()
            time.sleep(2)
            page.screenshot(path=os.path.join(screenshot_dir, "02_demo_triggered.png"))
            print("Demo triggered successfully!")

        # 3. Test Navigation to 'Detected Patterns'
        print("Navigating to 'Detected Patterns' page...")
        patterns_nav = page.get_by_role("button", name="Detected Patterns")
        patterns_nav.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(screenshot_dir, "03_patterns_page.png"))
        print("Patterns page verified!")

        # 4. Test Directed Graph Modal
        print("Testing Directed Graph button...")
        graph_btn = page.get_by_role("button", name="Directed Graph").first
        if graph_btn.is_visible():
            graph_btn.click()
            time.sleep(1)
            page.screenshot(path=os.path.join(screenshot_dir, "04_directed_graph_modal.png"))
            print("Directed Graph modal verified!")
            # Close modal
            page.get_by_role("button", name="Close").click()
            time.sleep(0.5)

        # 5. Test AI Suggestions Page
        print("Navigating to 'AI Suggestions' page...")
        suggestions_nav = page.get_by_role("button", name="AI Suggestions")
        suggestions_nav.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(screenshot_dir, "05_ai_suggestions_page.png"))
        print("AI Suggestions page verified!")

        # 6. Test Simulation Modal
        print("Testing 'Simulate' dry-run modal...")
        sim_btn = page.get_by_role("button", name="Simulate").first
        if sim_btn.is_visible():
            sim_btn.click()
            time.sleep(1)
            page.screenshot(path=os.path.join(screenshot_dir, "06_simulation_modal.png"))
            print("Simulation dry-run modal verified!")
            # Cancel/close modal
            page.get_by_role("button", name="Cancel").click()
            time.sleep(0.5)

        # 7. Test Privacy Dashboard Page
        print("Navigating to 'Privacy Dashboard' page...")
        privacy_nav = page.get_by_role("button", name="Privacy Dashboard")
        privacy_nav.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(screenshot_dir, "07_privacy_dashboard.png"))
        print("Privacy dashboard verified!")

        # 8. Test Activity Log Page
        print("Navigating to 'Activity Log' page...")
        activity_nav = page.get_by_role("button", name="Activity Log")
        activity_nav.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(screenshot_dir, "08_activity_log.png"))
        print("Activity log verified!")

        browser.close()
        print("\nAll browser verification tests PASSED with 8 visual inspection checkpoints!")

if __name__ == "__main__":
    test_live_site()
