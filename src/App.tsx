import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Public Pages
import { Home } from '@/pages/public/Home';
import { About } from '@/pages/public/About';
import { HowItWorks } from '@/pages/public/HowItWorks';
import { Products } from '@/pages/public/Products';
import { ProductDetail } from '@/pages/public/ProductDetail';
import { RanksPage } from '@/pages/public/RanksPage';
import { ServicesPage } from '@/pages/public/ServicesPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { TermsPage, PrivacyPage, DisclaimerPage } from '@/pages/public/LegalPages';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// User Dashboard Pages
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
import { RankProgressPage } from '@/pages/dashboard/RankProgressPage';
import { DashboardProducts } from '@/pages/dashboard/DashboardProducts';
import { DashboardSales } from '@/pages/dashboard/DashboardSales';
import { DashboardReferrals } from '@/pages/dashboard/DashboardReferrals';
import { DashboardRewards } from '@/pages/dashboard/DashboardRewards';
import { DashboardNotifications } from '@/pages/dashboard/DashboardNotifications';
import { DashboardProfile } from '@/pages/dashboard/DashboardProfile';

// Admin Dashboard Pages
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminSalesPage } from '@/pages/admin/AdminSalesPage';
import { AdminReferralsPage } from '@/pages/admin/AdminReferralsPage';
import { AdminRanksPage } from '@/pages/admin/AdminRanksPage';
import { AdminRewardsPage } from '@/pages/admin/AdminRewardsPage';
import { AdminCMSPage } from '@/pages/admin/AdminCMSPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';

// Common / 404
import { NotFound } from '@/pages/NotFound';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Portal Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetail />} />
              <Route path="ranks" element={<RanksPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="disclaimer" element={<DisclaimerPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Partner Protected Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="rank-progress" element={<RankProgressPage />} />
              <Route path="products" element={<DashboardProducts />} />
              <Route path="sales" element={<DashboardSales />} />
              <Route path="referrals" element={<DashboardReferrals />} />
              <Route path="rewards" element={<DashboardRewards />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="profile" element={<DashboardProfile />} />
            </Route>

            {/* Admin Management Panel */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="sales" element={<AdminSalesPage />} />
              <Route path="referrals" element={<AdminReferralsPage />} />
              <Route path="ranks" element={<AdminRanksPage />} />
              <Route path="rewards" element={<AdminRewardsPage />} />
              <Route path="cms" element={<AdminCMSPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
