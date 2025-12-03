import { test as base } from '@playwright/test';

// Import all page objects
import RoomSearchPage from './pages/guest/RoomSearchPage.js';
import ConfirmationPage from './pages/guest/ConfirmationPage.js';
import LoginPage from './pages/guest/LoginPage.js';
import DashboardPage from './pages/guest/DashboardPage.js';
import MyBookingsPage from './pages/guest/MyBookingsPage.js';
import AdminLoginPage from './pages/admin/AdminLoginPage.js';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.js';
import BookingOverviewPage from './pages/admin/BookingOverviewPage.js';
import RoomManagementPage from './pages/admin/RoomManagementPage.js';

// Define fixture types
type Fixtures = {
  roomSearchPage: RoomSearchPage;
  confirmationPage: ConfirmationPage;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  myBookingsPage: MyBookingsPage;
  adminLoginPage: AdminLoginPage;
  adminDashboardPage: AdminDashboardPage;
  bookingOverviewPage: BookingOverviewPage;
  roomManagementPage: RoomManagementPage;
};

// Extend base test with page object fixtures
export const test = base.extend<Fixtures>({
  roomSearchPage: async ({ page }, use) => {
    await use(new RoomSearchPage(page));
  },

  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  myBookingsPage: async ({ page }, use) => {
    await use(new MyBookingsPage(page));
  },

  adminLoginPage: async ({ page }, use) => {
    await use(new AdminLoginPage(page));
  },

  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },

  bookingOverviewPage: async ({ page }, use) => {
    await use(new BookingOverviewPage(page));
  },

  roomManagementPage: async ({ page }, use) => {
    await use(new RoomManagementPage(page));
  },
});

export { expect } from '@playwright/test';

