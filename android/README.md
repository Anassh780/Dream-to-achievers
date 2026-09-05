# Dream to Achievers — Native Android Application

Production-quality native Android application for **Dream to Achievers Global Network (Pvt) Ltd**.

Built with **Jetpack Compose**, **Material 3 Expressive**, **Navigation 3**, and backed directly by the existing **Firebase** backend (Firestore `uc-store-b5265` & Realtime Database `uc-store-b5265-default-rtdb`).

---

## 📱 Modules & Experiences

The application integrates three unified user experiences in a single native codebase with instant role-switching:

### 1. 🛒 Customer Experience (Phase 1)
- **Home & Discovery**: Promotional emerald hero banner, categories, and verified retail products.
- **Market Discovery**: Debounced search, category filters, and sorting.
- **Product Detail**: Multi-image carousel, specifications accordion, retail pricing (PKR), stock availability, and cart controls.
- **Cart & Checkout**: Multi-item cart, promo code support, delivery address, mobile wallet and bank transfer methods, and modern scoped Photo Picker slip upload.
- **Order Tracking**: Polished vertical timeline showing status updates, courier carrier (TCS, Trax, Leopard, PostEx), and tracking consignment number.
- **Customer Rewards & Account**: Referral link sharing, saved addresses, payment info, and support channels.

### 2. 💼 Reseller / Partner Experience (Phase 2)
- **Partner Dashboard**: Gross sales volume (PKR 245,800), period filter tabs (Today, 7D, 30D, All), 4 KPI bento tiles (Orders, Network, Wallet, Rank), quick actions row, wholesale opportunity banner, and recent sales ledger.
- **Wholesale Catalog**: Exclusive wholesale pricing (`partnerPrice`), suggested retail price, and guaranteed gross profit margin badges (up to 35% margin) with one-tap "Sell This Product" action.
- **Record Customer Sale**: Product picker, quantity stepper, custom selling price input with price floor validation, customer delivery details, modern Photo Picker payment slip upload, and live profit summary card.
- **Merchant Wallet & Payouts**: Hero balance card (Available, Realized, Pending, Withdrawn), payout request form (min PKR 500, EasyPaisa, JazzCash, SadaPay, NayaPay, Bank Transfer), and disbursement ledger.
- **Rank & Growth Roadmap**: Hero current rank card, dual concurrent progress bars (Qualifying Sales & Verified Network), referral code copying & WhatsApp sharing, and 4-tier milestone roadmap (Silver PKR 2,000, Platinum PKR 4,000, Gold PKR 6,000, Diamond PKR 10,000).

### 3. ⚡ Admin / SuperAdmin Experience (Phase 2)
- **Operations Hub**: Real-time platform KPI tiles (Pending Verifications, Pending Payouts, Gross Sales, Active Resellers).
- **Order Verification & Fulfillment**: Payment slip modal review, courier assignment dialog (TCS Express, Trax Logistics, Leopard Courier, PostEx), tracking number entry, and delivery confirmation that releases reseller profit margin into their wallet.
- **Withdrawal Approvals & Disbursement**: Payout requests queue, transaction reference ID logging, and payout confirmation.
- **User Directory & Permissions**: Searchable user list, role promotion/demotion pills (`Customer` <-> `Reseller` <-> `SuperAdmin`), and account status toggles.

### 4. 🔄 Real-Time Role Switcher
- A **Role** chip in the top app bar and account settings opens a modal sheet enabling real-time switching between Customer, Reseller, and Admin experiences without re-authenticating.

---

## 🏗️ Architecture & Package Structure

```
android/app/src/main/java/com/dreamtoachievers/app/
├── DreamToAchieversApp.kt       # Application class (Firebase & DataStore initialization)
├── MainActivity.kt              # Root Activity with Edge-to-edge, DI, and Deep-link handling
│
├── core/
│   ├── designsystem/            # Dta Design System
│   │   ├── theme/               # DtaColors, DtaTypography, DtaShapes, DtaSpacing, DtaMotion, DtaTheme
│   │   └── components/          # 20+ Shared Components (DtaTopAppBar, DtaSearchBar, DtaProductCard,
│   │                            # DtaPrimaryButton, DtaBottomNavigation, ResellerBottomNavigation,
│   │                            # DtaOrderCard, DtaPriceText, DtaPromoBanner, DtaLoadingSkeleton, etc.)
│   ├── model/                   # Domain Models (Product, PartnerProduct, ResellerSale, WithdrawalRequest,
│   │                            # RankDefinition, RankProgress, MilestoneReward, WalletLedger, User)
│   ├── data/                    # Repositories (ProductRepository, CartRepository, OrderRepository,
│   │                            # ResellerRepository, AdminRepository, RankEngine, UserRepository)
│   ├── firebase/                # Firebase Data Sources (Firestore & RTDB listeners and adapters)
│   └── navigation/              # DtaDestinations routes & DtaNavHost (Role-aware router)
│
└── feature/
    ├── splash/                  # Splash Screen
    ├── auth/                    # LoginScreen, RegisterScreen, AuthViewModel
    ├── home/                    # HomeScreen, HomeViewModel
    ├── market/                  # MarketScreen, WishlistScreen, MarketViewModel
    ├── product/                 # ProductDetailScreen, ProductDetailViewModel
    ├── cart/                    # CartScreen, CartViewModel
    ├── checkout/                # CheckoutScreen, OrderConfirmationScreen, CheckoutViewModel
    ├── orders/                  # OrdersScreen, OrdersViewModel
    ├── tracking/                # OrderTrackingScreen, OrderTrackingViewModel
    ├── growth/                  # CustomerRewardsScreen, CustomerRewardsViewModel
    ├── account/                 # AccountScreen, Profile, Addresses, PaymentMethods, Help & Legal
    ├── reseller/                # Reseller Feature (Dashboard, Catalog, RecordSale, Wallet, Growth)
    └── admin/                   # Admin Feature (Hub, OrderVerification, WithdrawalApproval, UserManagement)
```

---

## 🧪 Unit Tests

- [`CustomerBusinessRulesTest.kt`](app/src/test/java/com/dreamtoachievers/app/CustomerBusinessRulesTest.kt): Validates retail price isolation (ensuring no partner pricing leaks to customer), cart subtotal/discount calculations, free delivery thresholds, and order status mappings.
- [`ResellerAndAdminBusinessRulesTest.kt`](app/src/test/java/com/dreamtoachievers/app/ResellerAndAdminBusinessRulesTest.kt): Validates the dual-condition canonical Rank Engine (requiring both sales and community criteria), wholesale margin math, wallet ledger balance formulas, minimum withdrawal limits, courier tracking assignment, and delivery qualification profit release.

---

## 🚀 Opening in Android Studio

1. Launch **Android Studio** (Ladybug / Meerkat or later recommended).
2. Choose **Open Project** and select the `android/` directory inside this repository.
3. Android Studio will automatically synchronize the project using Gradle Kotlin DSL and `gradle/libs.versions.toml`.
4. Connect an Android emulator (API 26 to 36) or physical device.
5. Click **Run 'app'** (`Shift + F10`).
