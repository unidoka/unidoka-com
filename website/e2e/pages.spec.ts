import { test, expect, type Page } from '@playwright/test';

test.describe('Rovno.dev Pages', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
  });

  test('home page loads and displays hero section', async ({ page }: { page: Page }) => {
    await expect(page).toHaveTitle(/Rovno.dev/);
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('РАЗРАБОТКА');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('home page has working navigation links', async ({ page }: { page: Page }) => {
    const projectsLink = page.locator('nav a', { hasText: 'Проекты' });
    await expect(projectsLink).toBeVisible();
    await projectsLink.click();
    await expect(page).toHaveURL(/dprofile/);
  });

  test('home page displays selected works section', async ({ page }: { page: Page }) => {
    const selectedWorksHeading = page.locator('h2', { hasText: 'ИЗБРАННЫЕ ПРОЕКТЫ' });
    await expect(selectedWorksHeading).toBeVisible();
    const projectCards = page.locator('[data-slot="card"]');
    await expect(projectCards.first()).toBeVisible();
  });

  test('home page displays services section', async ({ page }: { page: Page }) => {
    const servicesHeading = page.locator('h2', { hasText: 'НАШИ УСЛУГИ' });
    await expect(servicesHeading).toBeVisible();
    const serviceCards = page.locator('[data-slot="card"]');
    await expect(serviceCards).toHaveCount(4);
  });

  test('home page has working CTA buttons', async ({ page }: { page: Page }) => {
    const auditButton = page.locator('a', { hasText: 'Бесплатный аудит проекта' });
    await expect(auditButton).toBeVisible();
    await expect(auditButton).toHaveAttribute('href', /forms\.yandex/);
    const projectsButton = page.locator('a', { hasText: 'Наши проекты' });
    await expect(projectsButton).toBeVisible();
    await expect(projectsButton).toHaveAttribute('href', /dprofile/);
  });

  test('about page loads correctly', async ({ page }: { page: Page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/Rovno.dev/);
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Создаем цифровые продукты');
    const expertCards = page.locator('[data-slot="card"]');
    await expect(expertCards).toHaveCount(3);
  });

  test('about page expert cards have correct links', async ({ page }: { page: Page }) => {
    await page.goto('/about');
    const firstExpertCard = page.locator('a[href^="/"]').first();
    await expect(firstExpertCard).toBeVisible();
    await firstExpertCard.click();
    await expect(page).toHaveURL(/\/niyazgim/);
  });

  test('expert page loads correctly', async ({ page }: { page: Page }) => {
    await page.goto('/niyazgim');
    const expertName = page.locator('h1');
    await expect(expertName).toBeVisible();
    await expect(expertName).toContainText('Нияз Гимадиев');
    const tags = page.locator('[data-slot="badge"]');
    await expect(tags.first()).toBeVisible();
    const tabs = page.locator('[data-slot="tabs-trigger"]');
    await expect(tabs).toHaveCount(1);
    await expect(tabs).toContainText('Проекты');
  });

  test('expert page displays projects', async ({ page }: { page: Page }) => {
    await page.goto('/niyazgim');
    const projectCards = page.locator('[data-slot="card"]');
    await expect(projectCards.first()).toBeVisible();
  });

  test('project page loads correctly', async ({ page }: { page: Page }) => {
    await page.goto('/vanguard');
    const projectTitle = page.locator('h1');
    await expect(projectTitle).toBeVisible();
    await expect(projectTitle).toContainText('Vanguard');
    const description = page.locator('p');
    await expect(description.first()).toBeVisible();
    const techBadges = page.locator('[data-slot="badge"]');
    await expect(techBadges.first()).toBeVisible();
  });

  test('project page displays metrics', async ({ page }: { page: Page }) => {
    await page.goto('/vanguard');
    const metricsHeading = page.locator('h2', { hasText: 'Результаты внедрения' });
    await expect(metricsHeading).toBeVisible();
    const metricCards = page.locator('[data-slot="card"]');
    await expect(metricCards).toHaveCount(3);
  });

  test('project page has working demo button', async ({ page }: { page: Page }) => {
    await page.goto('/vanguard');
    const demoButton = page.locator('a', { hasText: 'Запустить демо' });
    await expect(demoButton).toBeVisible();
    await expect(demoButton).toHaveAttribute('href', /dprofile/);
  });

  test('contacts page loads correctly', async ({ page }: { page: Page }) => {
    await page.goto('/contacts');
    await expect(page).toHaveTitle(/Rovno.dev/);
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ');
    const companyDetailsCard = page.locator('h2', { hasText: 'Реквизиты компании' });
    await expect(companyDetailsCard).toBeVisible();
    const documentsCard = page.locator('h2', { hasText: 'Документы' });
    await expect(documentsCard).toBeVisible();
  });

  test('contacts page displays certificates', async ({ page }: { page: Page }) => {
    await page.goto('/contacts');
    const certificatesHeading = page.locator('h2', { hasText: 'Сертификаты и лицензии' });
    await expect(certificatesHeading).toBeVisible();
    const certificateCards = page.locator('[data-slot="card"]');
    await expect(certificateCards).toHaveCount(6); 
  });

  test('404 page for non-existent routes', async ({ page }: { page: Page }) => {
    await page.goto('/non-existent-page');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2')).toContainText(/404|not found/i);
  });

  test('theme switcher works', async ({ page }: { page: Page }) => {
    const themeSwitcher = page.locator('button[aria-label="Поменять тему"]');
    await expect(themeSwitcher).toBeVisible();
    await themeSwitcher.click();
    const dropdownMenu = page.locator('[data-slot="dropdown-menu-content"]');
    await expect(dropdownMenu).toBeVisible();
    const darkOption = dropdownMenu.locator('span', { hasText: 'Тёмная' });
    await expect(darkOption).toBeVisible();
    await darkOption.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('mobile bottom app bar is visible on small screens', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const bottomAppBar = page.locator('nav[aria-label="Bottom app bar"]');
    await expect(bottomAppBar).toBeVisible();
    const navLinks = bottomAppBar.locator('a');
    await expect(navLinks).toHaveCount(4);
  });

  test('header navigation links work correctly', async ({ page }: { page: Page }) => {
    const headerNav = page.locator('header nav');
    const navLinks = headerNav.locator('a');
    await expect(navLinks).toHaveCount(3);
    const aboutLink = navLinks.filter({ hasText: 'О нас' });
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL('/about');
  });

  test('footer contains social media links', async ({ page }: { page: Page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    const socialLinks = footer.locator('a[target="_blank"]');
    await expect(socialLinks.first()).toBeVisible();
  });

  test('page has correct meta tags', async ({ page }: { page: Page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Rovno.dev/);
  });
});
