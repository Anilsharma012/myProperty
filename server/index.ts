import express from "express";
import cors from "cors";

import { connectToDatabase, getDatabase } from "./db/mongodb";
import { authenticateToken, requireAdmin } from "./middleware/auth";
import { ensureDatabase, databaseHealthCheck } from "./middleware/database";
import { ChatWebSocketServer } from "./websocket";
import { pushNotificationService } from "./services/pushNotificationService";
import { packageSyncService } from "./services/packageSyncService";

// Property routes
import {
  getProperties,
  getPropertyById,
  createProperty,
  getFeaturedProperties,
  getUserProperties,
  getUserNotifications,
  markUserNotificationAsRead,
  deleteUserNotification,
  getPendingProperties,
  // updatePropertyApproval,
  upload,
} from "./routes/properties";

// Category routes
import {
  getCategories,
  getCategoryBySlug,
  initializeCategories,
} from "./routes/categories";

// Authentication routes
import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  getUserProfile,
  updateUserProfile,
  googleAuth,
} from "./routes/auth";

// Admin routes
import {
  getAllUsers,
  getUserStats,
  getUserManagementStats,
  exportUsers,
  updateUserStatus,
  deleteUser,
  getAllProperties,
  initializeAdmin,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProperty,
  deleteProperty,
  createProperty as adminCreateProperty,
  getPremiumProperties,
  approvePremiumProperty,
  uploadCategoryIcon,
  getUserAnalytics,
  updatePropertyPromotion,
  updatePropertyApproval,
  createTestProperty,
  debugProperties,
  sendNotification,
  getAdminPackages,
  getAdminUserPackages,
} from "./routes/admin";

// Chat routes
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  startPropertyConversation,
  getUnreadCount,
} from "./routes/chat";

import { handleDemo } from "./routes/demo";
import { seedDatabase } from "./routes/seed";
import { initializeSystem } from "./routes/init";
import {
  sendEmailVerification,
  verifyEmail,
  resendEmailVerification,
} from "./routes/email-verification";

// Package routes
import {
  getAdPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  initializePackages,
} from "./routes/packages";

// Payment routes
import {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  updateTransactionStatus,
  verifyPayment,
  getPaymentMethods,
} from "./routes/payments";

// Payment settings routes
import {
  getPaymentSettings,
  updatePaymentSettings,
  testRazorpayConnection,
  getActivePaymentMethods,
} from "./routes/payment-settings";

// Banner routes
import {
  getBannersByPosition,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
  initializeBanners,
} from "./routes/banners";

// Analytics routes
import {
  trackPropertyView,
  trackPropertyInquiry,
  trackPhoneClick,
  getPropertyAnalytics,
  getSellerAnalytics,
  getAdminAnalytics,
} from "./routes/analytics";

// App routes
import {
  getAppInfo,
  downloadAPK,
  uploadAPK,
  getDownloadStats,
} from "./routes/app";

// Testimonials routes
import {
  getAllTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonialStatus,
  deleteTestimonial,
} from "./routes/testimonials";

// FAQ routes
import {
  getAllFAQs,
  getPublicFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  initializeFAQs,
} from "./routes/faqs";

// Blog routes
import {
  getAllBlogPosts,
  getPublicBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./routes/blog";

// Reports routes
import {
  getAllReportReasons,
  getPublicReportReasons,
  createReportReason,
  updateReportReason,
  deleteReportReason,
  getAllUserReports,
  createUserReport,
  updateUserReportStatus,
  initializeReportReasons,
} from "./routes/reports";

// User Packages routes
import {
  getAllUserPackages,
  getUserPackages,
  createUserPackage,
  updateUserPackageStatus,
  updatePackageUsage,
  cancelUserPackage,
  getPackageStats,
} from "./routes/user-packages";

// Content Management routes
import {
  getAllContentPages,
  getContentPageBySlug,
  createContentPage,
  updateContentPage,
  deleteContentPage,
  initializeContentPages,
  getPublishedPages,
  trackPageView,
} from "./routes/content";

// Homepage slider routes
// import {
//   getHomepageSliders,
//   getAdminHomepageSliders,
//   createHomepageSlider,
//   updateHomepageSlider,
//   deleteHomepageSlider,
//   initializeHomepageSliders,
// } from "./routes/homepage-sliders";

// Database test routes
import {
  testDatabase,
  testAdminUser,
  testAdminStats,
} from "./routes/database-test";

// Admin fix routes
import {
  forceCreateAdmin,
  fixAdminEndpoints,
  initializeSystemData,
} from "./routes/fix-admin";

// Staff management routes
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  updateStaffPassword,
  getRolesAndPermissions,
} from "./routes/staff";

// Notification management routes
import {
  getAllNotifications,
  sendNotification,
  getUsers,
  getNotificationById,
} from "./routes/notifications";

// Homepage slider routes
import {
  getHomepageSliders,
  getActiveHomepageSliders,
  createHomepageSlider,
  updateHomepageSlider,
  toggleSliderStatus,
  deleteHomepageSlider,
  initializeDefaultSlider,
  //  initializeHomepageSliders
} from "./routes/homepage-slider";

// Bank transfer routes
import {
  getAllBankTransfers,
  createBankTransfer,
  updateBankTransferStatus,
  getBankTransferById,
  getUserBankTransfers,
  deleteBankTransfer,
  getBankTransferStats,
} from "./routes/bank-transfers";

// Test data utilities
import { addBankTransferTestData } from "./scripts/addBankTransferTestData";

// Seller dashboard routes
import {
  getSellerProperties,
  getSellerNotifications,
  markNotificationAsRead,
  deleteSellerNotification,
  getSellerMessages,
  getSellerPackages,
  getSellerPayments,
  updateSellerProfile,
  changeSellerPassword,
  purchasePackage,
  getSellerStats,
} from "./routes/seller";

// Chatbot routes
import {
  sendChatbotMessage,
  getAdminChatConversations,
  getAdminChatMessages,
  sendAdminMessage,
  deleteChatConversation,
  getChatStatistics,
} from "./routes/chatbot";

// Sample data routes (for testing)
import {
  createSampleTransactions,
  clearAllTransactions,
} from "./routes/sample-transactions";

// Footer management routes
import {
  getAllFooterLinks,
  getActiveFooterLinks,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  getFooterSettings,
  updateFooterSettings,
  initializeFooterData,
} from "./routes/footer";
import { testFooterData } from "./routes/footerTest";

// Custom fields routes
import {
  getAllCustomFields,
  getCustomFieldById,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  updateCustomFieldStatus,
  reorderCustomFields,
  initializeCustomFields,
} from "./routes/custom-fields";

// Debug custom fields routes
import {
  testCustomFields,
  fixCustomFields,
} from "./routes/debug-custom-fields";

// Test push notification routes
import {
  testPushNotification,
  getPushNotificationStats,
  testUserConnection,
} from "./routes/test-push-notifications";

export function createServer() {
  const app = express();

 // ---- CORS (put this immediately after: const app = express()) ----
const RAW_ALLOWED_ORIGINS = [
  "https://ashishproperty.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Normalize to lower + trim once
const ALLOWED_SET = new Set(
  RAW_ALLOWED_ORIGINS.map(o => o.trim().toLowerCase())
);

// Small helper to normalize origin header safely
const normalizeOrigin = (o?: string | null) =>
  (o || "").trim().toLowerCase();

app.use((req, _res, next) => {
  // debug line to Railway logs
  console.log(
    "🔍 CORS dbg",
    JSON.stringify({
      method: req.method,
      path: req.path,
      origin: req.get("origin") || null,
      reqHeaders: req.get("access-control-request-headers") || null,
    })
  );
  next();
});

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow no-origin (mobile apps, curl, same-origin SW)
      if (!origin) return cb(null, true);

      const o = normalizeOrigin(origin);
      if (ALLOWED_SET.has(o)) return cb(null, true);

      // log and block others
      console.warn("🚫 CORS blocked:", origin);
      return cb(new Error("CORS: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Length", "Content-Type"],
    maxAge: 86400,
    optionsSuccessStatus: 200,
  })
);

// Let cors handle ALL preflight paths before any other middleware
app.options("*", cors());



  app.use(express.json({ limit: "1gb" }));
  app.use(express.urlencoded({ extended: true, limit: "1gb" }));

  // Initialize MongoDB connection
  connectToDatabase()
    .then(() => {
      console.log("✅ MongoDB Atlas connected successfully");
    })
    .catch((error) => {
      console.error("�� MongoDB connection failed:", error);
      console.log("Server will continue with limited functionality");
    });

  // Health check with database status
  app.get("/api/ping", async (req, res) => {
    const startTime = Date.now();

    try {
      // Try to get database connection
      let db;
      let dbStatus = "unknown";
      let dbError = null;

      try {
        db = getDatabase();
        // Test the connection
        await db.admin().ping();
        dbStatus = "connected";
      } catch (error: any) {
        dbError = error.message;
        try {
          // If database not initialized, try to connect
          console.log("🔄 Database not initialized, attempting connection...");
          const connection = await connectToDatabase();
          db = connection.db;
          await db.admin().ping();
          dbStatus = "connected";
        } catch (connectError: any) {
          dbStatus = "failed";
          dbError = connectError.message;
        }
      }

      const responseTime = Date.now() - startTime;

      const response = {
        message: "pong",
        status: "healthy",
        server: {
          environment: process.env.NODE_ENV || "unknown",
          port: process.env.PORT || 3000,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          responseTime: `${responseTime}ms`,
        },
        database: {
          status: dbStatus,
          name: db?.databaseName || "unknown",
          error: dbError,
        },
        request: {
          headers: {
            host: req.get("host"),
            "user-agent": req.get("user-agent")?.substring(0, 100),
            origin: req.get("origin"),
            referer: req.get("referer"),
          },
          ip: req.ip || req.connection.remoteAddress,
          method: req.method,
          url: req.url,
        },
        cors: {
          allowedOrigins: allowedOrigins,
          currentOrigin: req.get("origin"),
          isOriginAllowed: req.get("origin")
            ? allowedOrigins.includes(req.get("origin"))
            : true,
        },
        timestamp: new Date().toISOString(),
      };

      if (dbStatus === "connected") {
        res.json(response);
      } else {
        res.status(503).json(response);
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error("❌ Health check failed:", error.message);

      res.status(500).json({
        message: "pong",
        status: "unhealthy",
        error: error.message,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get("/api/demo", handleDemo);

  // Database seeding (development only)
  app.post("/api/seed", seedDatabase);

  // System initialization
  app.post("/api/init", initializeSystem);

  // Authentication routes
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/send-otp", sendOTP);
  app.post("/api/auth/verify-otp", verifyOTP);
  app.post("/api/auth/google", googleAuth);
  app.get("/api/auth/profile", authenticateToken, getUserProfile);
  app.put("/api/auth/profile", authenticateToken, updateUserProfile);

  // Email verification routes
  app.post("/api/auth/send-verification", sendEmailVerification);
  app.get("/api/auth/verify-email", verifyEmail);
  app.post(
    "/api/auth/resend-verification",
    authenticateToken,
    resendEmailVerification,
  );

  // Property routes (with database middleware)
  app.get("/api/properties", ensureDatabase, getProperties);
  app.get("/api/properties/featured", ensureDatabase, getFeaturedProperties);
  app.get("/api/properties/:id", ensureDatabase, getPropertyById);
  app.post(
    "/api/properties",
    authenticateToken,
    ensureDatabase,
    upload.array("images", 10),
    createProperty,
  );

  // User property management routes
  app.get("/api/user/properties", authenticateToken, getUserProperties);

  // User notification routes
  app.get("/api/user/notifications", authenticateToken, getUserNotifications);
  app.put(
    "/api/user/notifications/:notificationId/read",
    authenticateToken,
    markUserNotificationAsRead,
  );
  app.delete(
    "/api/user/notifications/:notificationId",
    authenticateToken,
    deleteUserNotification,
  );

  // Admin property approval routes
  app.get(
    "/api/admin/properties/pending",
    authenticateToken,
    requireAdmin,
    getPendingProperties,
  );
  app.put(
    "/api/admin/properties/:propertyId/approval",
    authenticateToken,
    requireAdmin,
    updatePropertyApproval,
  );

  // Category routes
  app.get("/api/categories", getCategories);
  app.get("/api/categories/:slug", getCategoryBySlug);
  app.post("/api/categories/initialize", initializeCategories);

  // Homepage slider routes
  app.get("/api/homepage-sliders", getHomepageSliders);
  // app.post("/api/homepage-sliders/initialize", initializeHomepageSliders);
  app.get(
    "/api/admin/homepage-sliders",
    authenticateToken,
    requireAdmin,
    // getAdminHomepageSliders,
  );
  app.post(
    "/api/admin/homepage-sliders",
    authenticateToken,
    requireAdmin,
    createHomepageSlider,
  );
  app.put(
    "/api/admin/homepage-sliders/:sliderId",
    authenticateToken,
    requireAdmin,
    updateHomepageSlider,
  );
  app.delete(
    "/api/admin/homepage-sliders/:sliderId",
    authenticateToken,
    requireAdmin,
    deleteHomepageSlider,
  );

  // Admin routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, getAllUsers);
  app.get("/api/admin/stats", authenticateToken, requireAdmin, getUserStats);
  app.get(
    "/api/admin/user-stats",
    authenticateToken,
    requireAdmin,
    getUserManagementStats,
  );
  app.get(
    "/api/admin/user-analytics",
    authenticateToken,
    requireAdmin,
    getUserAnalytics,
  );
  app.get(
    "/api/admin/users/export",
    authenticateToken,
    requireAdmin,
    exportUsers,
  );
  app.put(
    "/api/admin/users/:userId/status",
    authenticateToken,
    requireAdmin,
    updateUserStatus,
  );
  app.patch(
    "/api/admin/users/:userId/status",
    authenticateToken,
    requireAdmin,
    updateUserStatus,
  );
  app.delete(
    "/api/admin/users/:userId",
    authenticateToken,
    requireAdmin,
    deleteUser,
  );
  app.get(
    "/api/admin/properties",
    authenticateToken,
    requireAdmin,
    getAllProperties,
  );
  app.post(
    "/api/admin/properties",
    authenticateToken,
    requireAdmin,
    upload.array("images", 10),
    adminCreateProperty,
  );
  app.get(
    "/api/admin/categories",
    authenticateToken,
    requireAdmin,
    getAdminCategories,
  );
  app.post(
    "/api/admin/categories",
    authenticateToken,
    requireAdmin,
    createCategory,
  );
  app.put(
    "/api/admin/categories/:categoryId",
    authenticateToken,
    requireAdmin,
    updateCategory,
  );
  app.delete(
    "/api/admin/categories/:categoryId",
    authenticateToken,
    requireAdmin,
    deleteCategory,
  );
  app.post(
    "/api/admin/categories/upload-icon",
    authenticateToken,
    requireAdmin,
    uploadCategoryIcon,
  );
  app.put(
    "/api/admin/properties/:propertyId",
    authenticateToken,
    requireAdmin,
    upload.array("images", 10),
    updateProperty,
  );
  app.delete(
    "/api/admin/properties/:propertyId",
    authenticateToken,
    requireAdmin,
    deleteProperty,
  );
  app.get(
    "/api/admin/premium-properties",
    authenticateToken,
    requireAdmin,
    getPremiumProperties,
  );
  app.put(
    "/api/admin/premium-properties/:propertyId/approval",
    authenticateToken,
    requireAdmin,
    approvePremiumProperty,
  );
  app.put(
    "/api/admin/properties/:propertyId/promotion",
    authenticateToken,
    requireAdmin,
    updatePropertyPromotion,
  );

  app.post("/api/admin/initialize", initializeAdmin);
  app.post(
    "/api/admin/test-property",
    authenticateToken,
    requireAdmin,
    createTestProperty,
  );
  app.post("/api/create-test-properties", createTestProperty); // Temporary endpoint without auth for testing
  app.post("/api/seed-db", seedDatabase); // Temporary endpoint to seed database
  app.get("/api/debug-properties", debugProperties); // Debug endpoint to check properties
  app.put("/api/test-property-approval/:propertyId", async (req, res) => {
    try {
      console.log("🧪 TEST: Property approval request received:");
      console.log("📋 URL path:", req.path);
      console.log("📋 Route params:", req.params);
      console.log("📋 Property ID:", req.params.propertyId);
      console.log("📋 Request body:", req.body);

      res.json({
        success: true,
        receivedPropertyId: req.params.propertyId,
        receivedBody: req.body,
        message: "Test endpoint working",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }); // Test endpoint for property approval

  // Package routes
  app.get("/api/packages", getAdPackages);
  app.get("/api/packages/:packageId", getPackageById);
  app.post("/api/packages", authenticateToken, requireAdmin, createPackage);
  app.put(
    "/api/packages/:packageId",
    authenticateToken,
    requireAdmin,
    updatePackage,
  );
  app.delete(
    "/api/packages/:packageId",
    authenticateToken,
    requireAdmin,
    deletePackage,
  );
  app.post("/api/packages/initialize", initializePackages);

  // Payment routes
  app.post("/api/payments/transaction", authenticateToken, createTransaction);
  app.get("/api/payments/transactions", authenticateToken, getUserTransactions);
  app.get(
    "/api/admin/transactions",
    authenticateToken,
    requireAdmin,
    getAllTransactions,
  );
  app.put(
    "/api/admin/transactions/:transactionId",
    authenticateToken,
    requireAdmin,
    updateTransactionStatus,
  );
  app.put(
    "/api/admin/transactions/:transactionId/status",
    authenticateToken,
    requireAdmin,
    updateTransactionStatus,
  );
  app.post("/api/payments/verify", verifyPayment);
  app.get("/api/payments/methods", getPaymentMethods);

  // Payment settings routes (admin only)
  app.get(
    "/api/admin/payment-settings",
    authenticateToken,
    requireAdmin,
    getPaymentSettings,
  );
  app.put(
    "/api/admin/payment-settings",
    authenticateToken,
    requireAdmin,
    updatePaymentSettings,
  );
  app.post(
    "/api/admin/payment-settings/test-razorpay",
    authenticateToken,
    requireAdmin,
    testRazorpayConnection,
  );
  app.get("/api/payments/active-methods", getActivePaymentMethods);

  // Banner routes
  app.get("/api/banners/:position", getBannersByPosition);
  app.get("/api/admin/banners", authenticateToken, requireAdmin, getAllBanners);
  app.post("/api/admin/banners", authenticateToken, requireAdmin, createBanner);
  app.put(
    "/api/admin/banners/:bannerId",
    authenticateToken,
    requireAdmin,
    updateBanner,
  );
  app.delete(
    "/api/admin/banners/:bannerId",
    authenticateToken,
    requireAdmin,
    deleteBanner,
  );
  app.post(
    "/api/admin/banners/upload",
    authenticateToken,
    requireAdmin,
    uploadBannerImage,
  );
  app.post("/api/banners/initialize", initializeBanners);

  // Analytics routes
  app.post("/api/analytics/view/:propertyId", trackPropertyView);
  app.post(
    "/api/analytics/inquiry/:propertyId",
    authenticateToken,
    trackPropertyInquiry,
  );
  app.post("/api/analytics/phone/:propertyId", trackPhoneClick);
  app.get(
    "/api/analytics/property/:propertyId",
    authenticateToken,
    getPropertyAnalytics,
  );
  app.get("/api/analytics/seller", authenticateToken, getSellerAnalytics);
  app.get(
    "/api/admin/analytics",
    authenticateToken,
    requireAdmin,
    getAdminAnalytics,
  );

  // App routes
  app.get("/api/app/info", getAppInfo);
  app.get("/api/app/download", downloadAPK);
  app.post("/api/admin/app/upload", authenticateToken, requireAdmin, uploadAPK);
  app.get(
    "/api/admin/app/stats",
    authenticateToken,
    requireAdmin,
    getDownloadStats,
  );

  // Chat routes
  app.get("/api/chat/conversations", authenticateToken, getUserConversations);
  app.get(
    "/api/chat/conversations/:conversationId/messages",
    authenticateToken,
    getConversationMessages,
  );
  app.post("/api/chat/messages", authenticateToken, sendMessage);
  app.post(
    "/api/chat/start-property-conversation",
    authenticateToken,
    startPropertyConversation,
  );
  app.get("/api/chat/unread-count", authenticateToken, getUnreadCount);

  // Testimonials routes
  app.get("/api/testimonials", getPublicTestimonials);
  app.get(
    "/api/admin/testimonials",
    authenticateToken,
    requireAdmin,
    getAllTestimonials,
  );
  app.post("/api/testimonials", authenticateToken, createTestimonial);
  app.put(
    "/api/admin/testimonials/:testimonialId",
    authenticateToken,
    requireAdmin,
    updateTestimonialStatus,
  );
  app.delete(
    "/api/admin/testimonials/:testimonialId",
    authenticateToken,
    requireAdmin,
    deleteTestimonial,
  );

  // FAQ routes
  app.get("/api/faqs", getPublicFAQs);
  app.get("/api/admin/faqs", authenticateToken, requireAdmin, getAllFAQs);
  app.post("/api/admin/faqs", authenticateToken, requireAdmin, createFAQ);
  app.put("/api/admin/faqs/:faqId", authenticateToken, requireAdmin, updateFAQ);
  app.delete(
    "/api/admin/faqs/:faqId",
    authenticateToken,
    requireAdmin,
    deleteFAQ,
  );
  app.post("/api/faqs/initialize", initializeFAQs);

  // Blog routes
  app.get("/api/blog", getPublicBlogPosts);
  app.get("/api/blog/:slug", getBlogPostBySlug);
  app.get("/api/admin/blog", authenticateToken, requireAdmin, getAllBlogPosts);
  app.post("/api/admin/blog", authenticateToken, requireAdmin, createBlogPost);
  app.put(
    "/api/admin/blog/:postId",
    authenticateToken,
    requireAdmin,
    updateBlogPost,
  );
  app.delete(
    "/api/admin/blog/:postId",
    authenticateToken,
    requireAdmin,
    deleteBlogPost,
  );

  // Reports routes
  app.get("/api/reports/reasons", getPublicReportReasons);
  app.get(
    "/api/admin/reports/reasons",
    authenticateToken,
    requireAdmin,
    getAllReportReasons,
  );
  app.post(
    "/api/admin/reports/reasons",
    authenticateToken,
    requireAdmin,
    createReportReason,
  );
  app.put(
    "/api/admin/reports/reasons/:reasonId",
    authenticateToken,
    requireAdmin,
    updateReportReason,
  );
  app.delete(
    "/api/admin/reports/reasons/:reasonId",
    authenticateToken,
    requireAdmin,
    deleteReportReason,
  );
  app.get(
    "/api/admin/reports",
    authenticateToken,
    requireAdmin,
    getAllUserReports,
  );
  app.post("/api/reports", authenticateToken, createUserReport);
  app.put(
    "/api/admin/reports/:reportId",
    authenticateToken,
    requireAdmin,
    updateUserReportStatus,
  );
  app.post("/api/reports/initialize", initializeReportReasons);

  // User Packages routes
  app.get(
    "/api/admin/user-packages",
    authenticateToken,
    requireAdmin,
    getAllUserPackages,
  );
  app.get("/api/user-packages", authenticateToken, getUserPackages);
  app.post("/api/user-packages", authenticateToken, createUserPackage);
  app.put(
    "/api/admin/user-packages/:packageId",
    authenticateToken,
    requireAdmin,
    updateUserPackageStatus,
  );
  app.put(
    "/api/user-packages/:packageId/usage",
    authenticateToken,
    updatePackageUsage,
  );
  app.delete(
    "/api/user-packages/:packageId",
    authenticateToken,
    cancelUserPackage,
  );
  app.get(
    "/api/admin/package-stats",
    authenticateToken,
    requireAdmin,
    getPackageStats,
  );

  // Content Management routes
  app.get("/api/content/pages", getPublishedPages);
  app.get("/api/content/pages/slug/:slug", getContentPageBySlug); // Public page by slug
  app.post("/api/content/pages/:pageId/view", trackPageView); // Track page view // Track page view
  app.get(
    "/api/admin/content",
    authenticateToken,
    requireAdmin,
    getAllContentPages,
  );
  app.post(
    "/api/admin/content",
    authenticateToken,
    requireAdmin,
    createContentPage,
  );
  app.put(
    "/api/admin/content/:pageId",
    authenticateToken,
    requireAdmin,
    updateContentPage,
  );
  app.delete(
    "/api/admin/content/:pageId",
    authenticateToken,
    requireAdmin,
    deleteContentPage,
  );
  app.post("/api/content/initialize", initializeContentPages);

  // Database test routes (for debugging)
  app.get("/api/test/database", testDatabase);
  app.get("/api/test/admin-user", testAdminUser);
  app.get("/api/test/admin-stats", testAdminStats);

  // Admin fix routes
  app.post("/api/fix/create-admin", forceCreateAdmin);
  app.get("/api/fix/admin-endpoints", fixAdminEndpoints);
  app.post("/api/fix/initialize-system", initializeSystemData);

  // Staff management routes
  app.get("/api/admin/staff", authenticateToken, requireAdmin, getAllStaff);
  app.post("/api/admin/staff", authenticateToken, requireAdmin, createStaff);
  app.put(
    "/api/admin/staff/:staffId",
    authenticateToken,
    requireAdmin,
    updateStaff,
  );
  app.delete(
    "/api/admin/staff/:staffId",
    authenticateToken,
    requireAdmin,
    deleteStaff,
  );
  app.patch(
    "/api/admin/staff/:staffId/status",
    authenticateToken,
    requireAdmin,
    updateStaffStatus,
  );
  app.put(
    "/api/admin/staff/:staffId/password",
    authenticateToken,
    requireAdmin,
    updateStaffPassword,
  );
  app.get(
    "/api/admin/roles",
    authenticateToken,
    requireAdmin,
    getRolesAndPermissions,
  );

  // Notification management routes
  app.get(
    "/api/admin/notifications",
    authenticateToken,
    requireAdmin,
    getAllNotifications,
  );
  app.post(
    "/api/admin/notifications/send",
    authenticateToken,
    requireAdmin,
    sendNotification,
  );
  app.get(
    "/api/admin/notifications/users",
    authenticateToken,
    requireAdmin,
    getUsers,
  );
  app.get(
    "/api/admin/notifications/:notificationId",
    authenticateToken,
    requireAdmin,
    getNotificationById,
  );

  // User notification routes
  app.put(
    "/api/notifications/:notificationId/read",
    authenticateToken,
    async (req, res) => {
      try {
        const { pushNotificationService } = await import(
          "./services/pushNotificationService"
        );
        const userId = (req as any).userId;
        const { notificationId } = req.params;

        const success = await pushNotificationService.markNotificationAsRead(
          userId,
          notificationId,
        );

        if (success) {
          res.json({ success: true, message: "Notification marked as read" });
        } else {
          res
            .status(404)
            .json({ success: false, error: "Notification not found" });
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
          success: false,
          error: "Failed to mark notification as read",
        });
      }
    },
  );

  // Homepage slider management routes
  app.get(
    "/api/admin/homepage-sliders",
    authenticateToken,
    requireAdmin,
    getHomepageSliders,
  );
  app.post(
    "/api/admin/homepage-sliders",
    authenticateToken,
    requireAdmin,
    createHomepageSlider,
  );
  app.put(
    "/api/admin/homepage-sliders/:sliderId",
    authenticateToken,
    requireAdmin,
    updateHomepageSlider,
  );
  app.put(
    "/api/admin/homepage-sliders/:sliderId/toggle",
    authenticateToken,
    requireAdmin,
    toggleSliderStatus,
  );
  app.delete(
    "/api/admin/homepage-sliders/:sliderId",
    authenticateToken,
    requireAdmin,
    deleteHomepageSlider,
  );
  app.post(
    "/api/admin/homepage-sliders/initialize",
    authenticateToken,
    requireAdmin,
    initializeDefaultSlider,
  );

  // Public homepage slider routes
  app.get("/api/homepage-sliders", getActiveHomepageSliders);

  // Bank transfer management routes
  app.get(
    "/api/admin/bank-transfers",
    authenticateToken,
    requireAdmin,
    getAllBankTransfers,
  );
  app.get(
    "/api/admin/bank-transfers/stats",
    authenticateToken,
    requireAdmin,
    getBankTransferStats,
  );
  app.get(
    "/api/admin/bank-transfers/:transferId",
    authenticateToken,
    requireAdmin,
    getBankTransferById,
  );
  app.put(
    "/api/admin/bank-transfers/:transferId/status",
    authenticateToken,
    requireAdmin,
    updateBankTransferStatus,
  );
  app.delete(
    "/api/admin/bank-transfers/:transferId",
    authenticateToken,
    requireAdmin,
    deleteBankTransfer,
  );

  // User bank transfer routes
  app.post("/api/bank-transfers", authenticateToken, createBankTransfer);
  app.get("/api/user/bank-transfers", authenticateToken, getUserBankTransfers);

  // Bank transfer test data route (development)
  app.post(
    "/api/admin/bank-transfers/init-test-data",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
      try {
        await addBankTransferTestData();
        res.json({
          success: true,
          message: "Bank transfer test data initialized",
        });
      } catch (error) {
        console.error("Error initializing bank transfer test data:", error);
        res
          .status(500)
          .json({ success: false, error: "Failed to initialize test data" });
      }
    },
  );

  // Seller dashboard routes
  app.get("/api/seller/properties", authenticateToken, getSellerProperties);
  app.get(
    "/api/seller/notifications",
    authenticateToken,
    getSellerNotifications,
  );
  app.put(
    "/api/seller/notifications/:notificationId/read",
    authenticateToken,
    markNotificationAsRead,
  );
  app.delete(
    "/api/seller/notifications/:notificationId",
    authenticateToken,
    deleteSellerNotification,
  );
  app.get("/api/seller/messages", authenticateToken, getSellerMessages);
  app.get("/api/seller/packages", authenticateToken, getSellerPackages);
  app.get("/api/seller/payments", authenticateToken, getSellerPayments);
  app.put("/api/seller/profile", authenticateToken, updateSellerProfile);
  app.put(
    "/api/seller/change-password",
    authenticateToken,
    changeSellerPassword,
  );
  app.post("/api/seller/purchase-package", authenticateToken, purchasePackage);
  app.get("/api/seller/stats", authenticateToken, getSellerStats);

  // Chatbot routes
  app.post("/api/chatbot", sendChatbotMessage);
  app.get(
    "/api/admin/chat/conversations",
    authenticateToken,
    requireAdmin,
    getAdminChatConversations,
  );
  app.get(
    "/api/admin/chat/conversations/:conversationId/messages",
    authenticateToken,
    requireAdmin,
    getAdminChatMessages,
  );
  app.post(
    "/api/admin/chat/conversations/:conversationId/messages",
    authenticateToken,
    requireAdmin,
    sendAdminMessage,
  );
  app.delete(
    "/api/admin/chat/conversations/:conversationId",
    authenticateToken,
    requireAdmin,
    deleteChatConversation,
  );
  app.get(
    "/api/admin/chat/stats",
    authenticateToken,
    requireAdmin,
    getChatStatistics,
  );

  // Sample data routes (for testing)
  app.post(
    "/api/admin/sample-transactions",
    authenticateToken,
    requireAdmin,
    createSampleTransactions,
  );
  app.delete(
    "/api/admin/clear-transactions",
    authenticateToken,
    requireAdmin,
    clearAllTransactions,
  );

  // Push notification test routes (for debugging)
  app.post(
    "/api/test/push-notification",
    authenticateToken,
    testPushNotification,
  );
  app.get(
    "/api/test/push-notification/stats",
    authenticateToken,
    getPushNotificationStats,
  );
  app.get(
    "/api/test/push-notification/user/:userId",
    authenticateToken,
    testUserConnection,
  );

  // Footer management routes
  app.get("/api/footer/links", getActiveFooterLinks);
  app.get(
    "/api/admin/footer-links",
    authenticateToken,
    requireAdmin,
    getAllFooterLinks,
  );
  app.post(
    "/api/admin/footer-links",
    authenticateToken,
    requireAdmin,
    createFooterLink,
  );
  app.put(
    "/api/admin/footer-links/:linkId",
    authenticateToken,
    requireAdmin,
    updateFooterLink,
  );
  app.delete(
    "/api/admin/footer-links/:linkId",
    authenticateToken,
    requireAdmin,
    deleteFooterLink,
  );

  app.get("/api/footer/settings", getFooterSettings);
  app.get(
    "/api/admin/footer-settings",
    authenticateToken,
    requireAdmin,
    getFooterSettings,
  );
  app.put(
    "/api/admin/footer-settings",
    authenticateToken,
    requireAdmin,
    updateFooterSettings,
  );

  app.post("/api/footer/initialize", initializeFooterData);
  app.get("/api/footer/test", testFooterData);

  // Custom fields routes
  app.get(
    "/api/admin/custom-fields",
    authenticateToken,
    requireAdmin,
    getAllCustomFields,
  );
  app.get(
    "/api/admin/custom-fields/:fieldId",
    authenticateToken,
    requireAdmin,
    getCustomFieldById,
  );
  app.post(
    "/api/admin/custom-fields",
    authenticateToken,
    requireAdmin,
    createCustomField,
  );
  app.put(
    "/api/admin/custom-fields/:fieldId",
    authenticateToken,
    requireAdmin,
    updateCustomField,
  );
  app.delete(
    "/api/admin/custom-fields/:fieldId",
    authenticateToken,
    requireAdmin,
    deleteCustomField,
  );
  app.put(
    "/api/admin/custom-fields/:fieldId/status",
    authenticateToken,
    requireAdmin,
    updateCustomFieldStatus,
  );
  app.put(
    "/api/admin/custom-fields/reorder",
    authenticateToken,
    requireAdmin,
    reorderCustomFields,
  );
  app.post("/api/custom-fields/initialize", initializeCustomFields);

  // Admin notification and package management routes
  app.post(
    "/api/admin/send-notification",
    authenticateToken,
    requireAdmin,
    sendNotification,
  );
  app.get(
    "/api/admin/packages",
    authenticateToken,
    requireAdmin,
    getAdminPackages,
  );
  app.get(
    "/api/admin/user-packages",
    authenticateToken,
    requireAdmin,
    getAdminUserPackages,
  );

  // WebSocket debug routes
  const {
    getWebSocketStatus,
    testWebSocketConnection,
  } = require("./routes/websocket-debug");
  app.get("/api/debug/websocket-status", getWebSocketStatus);
  app.post("/api/debug/websocket-test", testWebSocketConnection);

  // Debug custom fields endpoints (for troubleshooting)
  app.get("/api/debug/custom-fields", testCustomFields);
  app.post("/api/debug/custom-fields/fix", fixCustomFields);

  // Health check endpoint for network monitoring
  app.get("/api/health", databaseHealthCheck, (req, res) => {
    const dbStatus = req.databaseStatus || {
      connected: false,
      responsive: false,
    };

    res.json({
      status: dbStatus.connected && dbStatus.responsive ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: dbStatus.connected,
        responsive: dbStatus.responsive,
        error: dbStatus.error,
      },
    });
  });

  return app;
}

// Initialize push notification service
export function initializePushNotifications(server: any) {
  pushNotificationService.initialize(server);
  console.log("📱 Push notification service initialized");
}

// Initialize package sync service
export function initializePackageSync(server: any) {
  packageSyncService.initialize(server);
  console.log("📦 Package sync service initialized");
}

// For production
