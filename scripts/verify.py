"""Smoke checks for the actual page, using an existing Playwright installation."""
from pathlib import Path
from playwright.sync_api import sync_playwright

output = Path('artifacts')
output.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    response = page.goto('http://127.0.0.1:5173', wait_until='networkidle')
    assert response.status == 200
    page.evaluate('document.fonts.ready')
    assert page.evaluate("document.fonts.check('700 100px \"Barlow Condensed\"')")
    assert page.locator('h1').count() == 1
    assert page.locator('.project').count() == 4
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(output / 'desktop.png'))
    page.locator('.header nav a[href="#projetos"]').click()
    page.wait_for_timeout(1200)
    assert page.locator('#destination-year').inner_text() == '2015'
    page.screenshot(path=str(output / 'projects.png'))
    page.locator('.motion-toggle').click()
    assert page.locator('.motion-toggle').get_attribute('aria-pressed') == 'true'
    page.locator('.motion-toggle').click()
    assert page.locator('.motion-toggle').get_attribute('aria-pressed') == 'false'
    page.locator('#sobre').scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    assert page.locator('#destination-label').inner_text() == 'CONHEÇA O PILOTO'
    page.screenshot(path=str(output / 'about.png'))
    with page.expect_download() as download:
        page.locator('a[download]').click()
    assert download.value.suggested_filename.endswith('.pdf')
    assert page.request.get('http://127.0.0.1:5173/assets/pedro-victor-curriculo.pdf').status == 200
    assert page.locator('a[href^="mailto:"]').count() == 1
    for width in (390, 768, 1024):
        page.set_viewport_size({"width": width, "height": 844})
        page.goto('http://127.0.0.1:5173', wait_until='networkidle')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'overflow at {width}'
        if width == 390:
            page.screenshot(path=str(output / 'mobile.png'), full_page=True)
            page.locator('.header a[href="#projetos"]').click()
            page.wait_for_timeout(1000)
            assert abs(page.locator('#projetos').bounding_box()['y']) < 100
    page.emulate_media(reduced_motion='reduce')
    page.reload(wait_until='networkidle')
    assert page.locator('.motion-toggle').get_attribute('aria-pressed') == 'true'
    assert page.locator('.car-position').evaluate('(el) => getComputedStyle(el).transform') == 'none'
    assert not errors, errors
    print('PASS: desktop, mobile, anchors, scroll state, motion toggle, reduced motion, PDF download, no JavaScript errors.')
    browser.close()
