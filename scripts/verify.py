"""Browser checks against the local preview; requires installed Playwright and Edge."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

output = Path('artifacts')
output.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
    errors, failed_assets = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: failed_assets.append(response.url) if response.status >= 400 else None)
    assert page.goto('http://127.0.0.1:5173', wait_until='networkidle').status == 200
    page.evaluate('document.fonts.ready')
    assert page.evaluate("document.fonts.check('700 60px Syne') && document.fonts.check('400 14px Manrope')")
    page.screenshot(path=str(output / 'v3-desktop.png'))
    assert page.locator('.project').count() == 3
    assert page.locator('.poster').count() == 2
    assert page.locator('.record').count() == 2
    assert page.locator('a[href*="cogudex"]').count() == 0
    assert page.locator('.brand > span, .contact-symbol').count() == 0
    assert page.locator('.tech-logo img').count() == 18
    assert page.locator('.record-label img').count() == 2
    assert page.locator('.chapter').evaluate_all('(els) => els.map(el => el.id)') == ['inicio', 'sobre', 'trajetoria', 'projetos', 'contato']
    assert page.locator('.chapters > .favorites').count() == 0
    assert page.locator('#file-1 .personal-catalog').count() == 1
    assert not page.locator('.personal-catalog').is_visible()

    def visit_section(section):
        page.locator(f'#{section}').evaluate('(el) => el.scrollIntoView({block:"start",behavior:"instant"})')
        page.wait_for_function('(id) => document.querySelector(`.route a[href="#${id}"]`).getAttribute("aria-current") === "location"', arg=section)
        if section in ('sobre', 'trajetoria', 'projetos'):
            assert page.locator('.header nav a[aria-current="location"]').get_attribute('href') == '#' + section

    # Real scroll input at two rates: speed rises, particles render, and the car coasts to rest.
    page.evaluate("document.documentElement.style.scrollBehavior='auto'")
    slow, fast, max_alpha = 0, 0, 0
    for _ in range(12):
        page.mouse.wheel(0, 8)
        page.wait_for_timeout(55)
        slow = max(slow, int(page.locator('#speed-value').inner_text()))
    page.wait_for_timeout(1800)
    for _ in range(10):
        page.mouse.wheel(0, 65)
        page.wait_for_timeout(35)
        fast = max(fast, int(page.locator('#speed-value').inner_text()))
        max_alpha = max(max_alpha, page.locator('.sparks').evaluate('(el) => {const d=el.getContext("2d").getImageData(0,0,el.width,el.height).data; let n=0; for(let i=3;i<d.length;i+=4) if(d[i]) n++; return n}'))
    assert fast > slow, (slow, fast)
    assert max_alpha > 0, 'No visible sparks during acceleration'
    page.screenshot(path=str(output / 'v2-acceleration.png'))
    page.wait_for_timeout(2200)
    assert page.locator('#speed-value').inner_text() == '00'
    visit_section('projetos')
    page.wait_for_timeout(300)
    assert page.locator('#destination-year').inner_text() == '2015'
    page.locator('.motion-toggle').click()
    assert page.locator('.motion-toggle').get_attribute('aria-pressed') == 'true'
    page.mouse.wheel(0, 200)
    page.wait_for_timeout(200)
    assert page.locator('#speed-value').inner_text() == '00'
    assert page.locator('.sparks').evaluate('(el) => getComputedStyle(el).opacity') == '0'
    page.locator('.motion-toggle').click()

    visit_section('sobre')
    page.wait_for_timeout(300)
    assert page.locator('#destination-month').inner_text() == 'AGO'
    page.locator('#tab-1').click()
    assert page.locator('#file-1').is_visible()
    assert not page.locator('#file-0').is_visible()
    assert page.locator('.personal-catalog').is_visible()
    assert page.locator('#file-1 .poster').count() == 2
    assert page.locator('#file-1 .record').count() == 2
    page.locator('.personal-catalog').scroll_into_view_if_needed()
    page.screenshot(path=str(output / 'v4-catalog.png'))
    page.locator('#tab-1').press('ArrowRight')
    assert page.locator('#tab-2').get_attribute('aria-selected') == 'true'
    page.locator('#tab-0').click()
    page.screenshot(path=str(output / 'v2-about.png'))
    with page.expect_download() as download:
        page.locator('.career a[download]').click()
    assert download.value.suggested_filename.endswith('.pdf')

    page.locator('#sender').fill('visitor@example.com')
    page.locator('#subject').fill('Idea & time travel?')
    page.locator('#message').fill('Hello Pedro!\nLet’s build something.')
    page.locator('.contact-form button').click()
    assert page.locator('.draft-link').is_visible()
    mailto = page.locator('.draft-link').get_attribute('href')
    query = parse_qs(urlparse(mailto).query)
    assert query['subject'] == ['Idea & time travel?']
    assert 'visitor@example.com' in query['body'][0]
    page.locator('#subject').fill('Changed draft')
    assert not page.locator('.draft-link').is_visible()

    page.evaluate('window.scrollTo(0, 0)')
    page.locator('.theme-toggle').click()
    assert page.locator('html').get_attribute('data-theme') == 'light'
    page.reload(wait_until='networkidle')
    assert page.locator('html').get_attribute('data-theme') == 'light'
    page.screenshot(path=str(output / 'v2-light.png'))
    page.locator('[data-language="en"]').click()
    page.wait_for_load_state('networkidle')
    assert '/en/' in page.url
    assert page.locator('html').get_attribute('lang') == 'en'
    assert 'line of code' in page.locator('h1').inner_text()
    assert page.locator('#destination-month').inner_text() == 'OCT'
    assert page.locator('.motion-text').inner_text() == 'Pause effects'
    page.locator('.theme-toggle').click()
    page.screenshot(path=str(output / 'v2-english.png'))

    for route in ('/', '/en/'):
        for width in (320, 390, 768, 1024, 1440):
            page.set_viewport_size({'width': width, 'height': 844})
            page.goto('http://127.0.0.1:5173' + route, wait_until='networkidle')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width)
            for selector in ('.project-copy > p:not(.project-category)', '.terminal-file', '.timeline article > p:last-child', '.contact-form label'):
                assert page.locator(selector).first.evaluate('(el) => parseFloat(getComputedStyle(el).fontSize)') >= 14, (route, width, selector)
            page.locator('.skills').scroll_into_view_if_needed()
            page.wait_for_timeout(150)
            assert page.locator('.tech-logo img').evaluate_all('(els) => els.every(el => el.complete && el.naturalWidth > 0)')
            page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
            assert abs(page.locator('.header').bounding_box()['y']) < 1
            for section in ('sobre', 'trajetoria', 'projetos'):
                page.locator(f'.header nav a[href="#{section}"]').click()
                page.wait_for_function('(id) => document.querySelector(`.header nav a[href="#${id}"]`).getAttribute("aria-current") === "location"', arg=section)
                page.wait_for_timeout(1000)
                assert abs(page.locator('.header').bounding_box()['y']) < 1
                offset = page.evaluate('parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset"))')
                assert abs(page.locator('#' + section).bounding_box()['y'] - offset) < 4, (route, width, section)
            visit_section('sobre')
            page.locator('#tab-1').click()
            page.locator('#file-1 .poster img').first.scroll_into_view_if_needed()
            page.wait_for_timeout(200)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), ('catalog', route, width)
            assert page.locator('#file-1 .poster img').evaluate_all('(els) => els.every(el => el.complete && el.naturalWidth > 0)')
            page.locator('#tab-0').click()
            page.locator('.route a[href="#inicio"]').click()
            page.wait_for_timeout(1100)
            if width == 390 and route == '/':
                page.screenshot(path=str(output / 'v2-mobile.png'))
                page.locator('.header a[href="#projetos"]').click()
                page.wait_for_timeout(1100)
                offset = page.evaluate('parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset"))')
                assert abs(page.locator('#projetos').bounding_box()['y'] - offset) < 4
                assert page.locator('#destination-year').is_visible()
                assert page.locator('#destination-year').inner_text() == '2015'
                page.screenshot(path=str(output / 'v2-mobile-projects.png'))
    page.emulate_media(reduced_motion='reduce')
    page.reload(wait_until='networkidle')
    assert page.locator('.motion-toggle').get_attribute('aria-pressed') == 'true'
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(300)
    assert page.locator('#speed-value').inner_text() == '00'
    assert page.locator('.sparks').evaluate('(el) => getComputedStyle(el).opacity') == '0'
    assert not errors, errors
    assert not failed_assets, failed_assets
    print(f'PASS: PT/EN, 5 viewport widths, themes, tabs/keyboard, email draft, PDF, scroll dates, acceleration ({slow} < {fast}), sparks ({max_alpha} pixels), coasting, reduced motion; no JS or asset errors.')
    browser.close()
