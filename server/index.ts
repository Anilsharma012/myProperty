import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";


import { installCors } from "./middleware/cors";
/**
 * ⚠️ Intentional: hum 'cors' package use nahi kar rahe.
 * Railway pe Netlify se aane wali credentials wali requests ke liye
 * manual CORS lagaya hai jo preflight ko 204 ke saath turant return karta hai.
 */

import { connectToDatabase, getDatabase } from "./db/mongodb";
import { authenticateToken, requireAdmin } from "./middleware/auth";
import { ensureDatabase, databaseHealthCheck } from "./middleware/database";
import { pushNotificationService } from "./services/pushNotificationService";
import { packageSyncService } from "./services/packageSyncService";
import { getWebSocketStatus, testWebSocketConnection } from "./routes/websocket-debug";

/* ----------------------------- Property routes ---------------------------- */
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
  updatePropertyApproval,
  upload,
} from "./routes/properties";

/* ----------------------------- Category routes ---------------------------- */
import {
  getCategories,
  getCategoryBySlug,
  initializeCategories,
} from "./routes/categories";

/* --------------------------- Authentication routes ------------------------ */
import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  getUserProfile,
  updateUserProfile,
  googleAuth,
} from "./routes/auth";

/* --------------------------------- Admin --------------------------------- */
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
  createTestProperty,
  debugProperties,
  sendNotification,
  getAdminPackages,
  getAdminUserPackages,
} from "./routes/admin";

/* ---------------------------------- Chat --------------------------------- */
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  startPropertyConversation,
  getUnreadCount,
} from "./routes/chat";

/* -------------------------- Misc service routes -------------------------- */
import { handleDemo } from "./routes/demo";
import { seedDatabase } from "./routes/seed";
import { initializeSystem } from "./routes/init";
import {
  sendEmailVerification,
  verifyEmail,
  resendEmailVerification,
} from "./routes/email-verification";

/* ------------------------------ Packages API ----------------------------- */
import {
  getAdPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  initializePackages,
} from "./routes/packages";

/* ------------------------------- Payments API ---------------------------- */
import {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  updateTransactionStatus,
  verifyPayment,
  getPaymentMethods,
} from "./routes/payments";

import {
  getPaymentSettings,
  updatePaymentSettings,
  testRazorpayConnection,
  getActivePaymentMethods,
} from "./routes/payment-settings";

/* --------------------------------- Banners -------------------------------- */
import {
  getBannersByPosition,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
  initializeBanners,
} from "./routes/banners";

/* -------------------------------- Analytics ------------------------------- */
import {
  trackPropertyView,
  trackPropertyInquiry,
  trackPhoneClick,
  getPropertyAnalytics,
  getSellerAnalytics,
  getAdminAnalytics,
} from "./routes/analytics";

/* ---------------------------------- App ---------------------------------- */
import { getAppInfo, downloadAPK, uploadAPK, getDownloadStats } from "./routes/app";

/* ------------------------------ Testimonials ----------------------------- */
import {
  getAllTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonialStatus,
  deleteTestimonial,
} from "./routes/testimonials";

/* ----------------------------------- FAQ --------------------------------- */
import {
  getAllFAQs,
  getPublicFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  initializeFAQs,
} from "./routes/faqs";

/* ---------------------------------- Blog --------------------------------- */
import {
  getAllBlogPosts,
  getPublicBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./routes/blog";

/* -------------------------------- Reports -------------------------------- */
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

/* ----------------------------- User packages ----------------------------- */
import {
  getAllUserPackages,
  getUserPackages,
  createUserPackage,
  updateUserPackageStatus,
  updatePackageUsage,
  cancelUserPackage,
  getPackageStats,
} from "./routes/user-packages";

/* ------------------------------- CMS/Content ------------------------------ */
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

/* ----------------------------- DB test/fix etc ---------------------------- */
import { testDatabase, testAdminUser, testAdminStats } from "./routes/database-test";
import { forceCreateAdmin, fixAdminEndpoints, initializeSystemData } from "./routes/fix-admin";

/* ---------------------------------- Staff -------------------------------- */
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  updateStaffPassword,
  getRolesAndPermissions,
} from "./routes/staff";

/* --------------------------- Notifications admin ------------------------- */
import {
  getAllNotifications,
  getUsers,
  getNotificationById,
} from "./routes/notifications";

/* ----------------------------- Homepage slider --------------------------- */
import {
  getHomepageSliders,
  getActiveHomepageSliders,
  createHomepageSlider,
  updateHomepageSlider,
  toggleSliderStatus,
  deleteHomepageSlider,
  initializeDefaultSlider,
} from "./routes/homepage-slider";

/* ------------------------------- Bank transfer --------------------------- */
import {
  getAllBankTransfers,
  createBankTransfer,
  updateBankTransferStatus,
  getBankTransferById,
  getUserBankTransfers,
  deleteBankTransfer,
  getBankTransferStats,
} from "./routes/bank-transfers";
import { addBankTransferTestData } from "./scripts/addBankTransferTestData";

/* --------------------------------- Seller -------------------------------- */
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

/* -------------------------------- Chatbot -------------------------------- */
import {
  sendChatbotMessage,
  getAdminChatConversations,
  getAdminChatMessages,
  sendAdminMessage,
  deleteChatConversation,
  getChatStatistics,
} from "./routes/chatbot";

/* ---------------------------- Sample data/test ---------------------------- */
import { createSampleTransactions, clearAllTransactions } from "./routes/sample-transactions";

/* --------------------------------- Footer -------------------------------- */
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

/* ----------------------------- Custom fields ----------------------------- */
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
import { testCustomFields, fixCustomFields } from "./routes/debug-custom-fields";

/* ------------------------ Push notification debug ------------------------ */
import {
  testPushNotification,
  getPushNotificationStats,
  testUserConnection,
} from "./routes/test-push-notifications";



export function createServer() {
  const app = express();

app.set("trust proxy", 1);

  app.get("/__up", (_req, res) => {
    res.status(200).json({ ok: true, ts: Date.now() });
  });





  
  installCors(app, { log: true });


  app.use((req, _res, next) => {
  console.log("➡️  EXTERNAL HIT", req.method, req.originalUrl);
  next();
});

  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  /* ------------------------------ Liveness/Probe ------------------------------ */
  app.use("/api", (req, res) => {
    res.status(404).json({ error: "Not Found", path: req.path });
  });
  

  /* -------------------------------- Diagnostics ------------------------------- */
  app.get("/api/ping", async (req, res) => {
    const start = Date.now();
    let dbStatus = "unknown";
    let dbName = "unknown";
    let dbError: string | null = null;

    try {
      const db = getDatabase();
      await db.admin().ping();
      dbStatus = "connected";
      dbName = db.databaseName;
    } catch (e: any) {
      dbError = e?.message || String(e);
      try {
        const conn = await connectToDatabase();
        await conn.db.admin().ping();
        dbStatus = "connected";
        dbName = conn.db.databaseName;
      } catch (e2: any) {
        dbStatus = "failed";
        dbError = e2?.message || String(e2);
      }
    }

    res.status(dbStatus === "connected" ? 200 : 503).json({
      message: "pong",
      status: dbStatus === "connected" ? "healthy" : "degraded",
      server: {
        env: process.env.NODE_ENV || "unknown",
        port: process.env.PORT || "(env PORT not read yet)",
        uptime: process.uptime(),
        responseTimeMs: Date.now() - start,
      },
      database: { status: dbStatus, name: dbName, error: dbError },
      timestamp: new Date().toISOString(),
    });
  });

  /* --------------------------------- Demo/Seed -------------------------------- */
  app.get("/api/demo", handleDemo);
  app.post("/api/seed", seedDatabase);
  app.post("/api/init", initializeSystem);

  /* ------------------------------- Auth routes -------------------------------- */
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/send-otp", sendOTP);
  app.post("/api/auth/verify-otp", verifyOTP);
  app.post("/api/auth/google", googleAuth);
  app.get("/api/auth/profile", authenticateToken, getUserProfile);
  app.put("/api/auth/profile", authenticateToken, updateUserProfile);

  app.post("/api/auth/send-verification", sendEmailVerification);
  app.get("/api/auth/verify-email", verifyEmail);
  app.post("/api/auth/resend-verification", authenticateToken, resendEmailVerification);

  /* ------------------------------ Property routes ----------------------------- */
  app.get("/api/properties", ensureDatabase, getProperties);
  app.get("/api/properties/featured", ensureDatabase, getFeaturedProperties);
  app.get("/api/properties/:id", ensureDatabase, getPropertyById);
  app.post(
    "/api/properties",
    authenticateToken,
    ensureDatabase,
    upload.array("images", 10),
    createProperty
  );

  app.get("/api/user/properties", authenticateToken, getUserProperties);
  app.get("/api/user/notifications", authenticateToken, getUserNotifications);
  app.put(
    "/api/user/notifications/:notificationId/read",
    authenticateToken,
    markUserNotificationAsRead
  );
  app.delete(
    "/api/user/notifications/:notificationId",
    authenticateToken,
    deleteUserNotification
  );

  /* --------------------------------- Admin ----------------------------------- */
  app.get("/api/admin/properties/pending", authenticateToken, requireAdmin, getPendingProperties);
  app.put(
    "/api/admin/properties/:propertyId/approval",
    authenticateToken,
    requireAdmin,
    updatePropertyApproval
  );

  app.get("/api/categories", getCategories);
  app.get("/api/categories/:slug", getCategoryBySlug);
  app.post("/api/categories/initialize", initializeCategories);

  // Homepage sliders
  app.get("/api/homepage-sliders", getHomepageSliders);
  app.get("/api/admin/homepage-sliders", authenticateToken, requireAdmin, getHomepageSliders);
  app.post("/api/admin/homepage-sliders", authenticateToken, requireAdmin, createHomepageSlider);
  app.put(
    "/api/admin/homepage-sliders/:sliderId",
    authenticateToken,
    requireAdmin,
    updateHomepageSlider
  );
  app.put(
    "/api/admin/homepage-sliders/:sliderId/toggle",
    authenticateToken,
    requireAdmin,
    toggleSliderStatus
  );
  app.delete(
    "/api/admin/homepage-sliders/:sliderId",
    authenticateToken,
    requireAdmin,
    deleteHomepageSlider
  );
  app.post(
    "/api/admin/homepage-sliders/initialize",
    authenticateToken,
    requireAdmin,
    initializeDefaultSlider
  );

  // Admin core
  app.get("/api/admin/users", authenticateToken, requireAdmin, getAllUsers);
  app.get("/api/admin/stats", authenticateToken, requireAdmin, getUserStats);
  app.get("/api/admin/user-stats", authenticateToken, requireAdmin, getUserManagementStats);
  app.get("/api/admin/user-analytics", authenticateToken, requireAdmin, getUserAnalytics);
  app.get("/api/admin/users/export", authenticateToken, requireAdmin, exportUsers);
  app.put("/api/admin/users/:userId/status", authenticateToken, requireAdmin, updateUserStatus);
  app.patch("/api/admin/users/:userId/status", authenticateToken, requireAdmin, updateUserStatus);
  app.delete("/api/admin/users/:userId", authenticateToken, requireAdmin, deleteUser);

  app.get("/api/admin/properties", authenticateToken, requireAdmin, getAllProperties);
  app.post(
    "/api/admin/properties",
    authenticateToken,
    requireAdmin,
    upload.array("images", 10),
    adminCreateProperty
  );
  app.put(
    "/api/admin/properties/:propertyId",
    authenticateToken,
    requireAdmin,
    upload.array("images", 10),
    updateProperty
  );
  app.delete("/api/admin/properties/:propertyId", authenticateToken, requireAdmin, deleteProperty);

  app.get("/api/admin/categories", authenticateToken, requireAdmin, getAdminCategories);
  app.post("/api/admin/categories", authenticateToken, requireAdmin, createCategory);
  app.put("/api/admin/categories/:categoryId", authenticateToken, requireAdmin, updateCategory);
  app.delete("/api/admin/categories/:categoryId", authenticateToken, requireAdmin, deleteCategory);
  app.post(
    "/api/admin/categories/upload-icon",
    authenticateToken,
    requireAdmin,
    uploadCategoryIcon
  );

  app.get("/api/admin/premium-properties", authenticateToken, requireAdmin, getPremiumProperties);
  app.put(
    "/api/admin/premium-properties/:propertyId/approval",
    authenticateToken,
    requireAdmin,
    approvePremiumProperty
  );
  app.put(
    "/api/admin/properties/:propertyId/promotion",
    authenticateToken,
    requireAdmin,
    updatePropertyPromotion
  );

  app.post("/api/admin/initialize", initializeAdmin);
  app.post("/api/admin/test-property", authenticateToken, requireAdmin, createTestProperty);
  app.post("/api/create-test-properties", createTestProperty);
  app.post("/api/seed-db", seedDatabase);
  app.get("/api/debug-properties", debugProperties);

  /* ------------------------------- Packages ---------------------------------- */
  app.get("/api/packages", getAdPackages);
  app.get("/api/packages/:packageId", getPackageById);
  app.post("/api/packages", authenticateToken, requireAdmin, createPackage);
  app.put("/api/packages/:packageId", authenticateToken, requireAdmin, updatePackage);
  app.delete("/api/packages/:packageId", authenticateToken, requireAdmin, deletePackage);
  app.post("/api/packages/initialize", initializePackages);

  /* -------------------------------- Payments --------------------------------- */
  app.post("/api/payments/transaction", authenticateToken, createTransaction);
  app.get("/api/payments/transactions", authenticateToken, getUserTransactions);
  app.get("/api/admin/transactions", authenticateToken, requireAdmin, getAllTransactions);
  app.put(
    "/api/admin/transactions/:transactionId",
    authenticateToken,
    requireAdmin,
    updateTransactionStatus
  );
  app.put(
    "/api/admin/transactions/:transactionId/status",
    authenticateToken,
    requireAdmin,
    updateTransactionStatus
  );
  app.post("/api/payments/verify", verifyPayment);
  app.get("/api/payments/methods", getPaymentMethods);

  app.get("/api/admin/payment-settings", authenticateToken, requireAdmin, getPaymentSettings);
  app.put("/api/admin/payment-settings", authenticateToken, requireAdmin, updatePaymentSettings);
  app.post(
    "/api/admin/payment-settings/test-razorpay",
    authenticateToken,
    requireAdmin,
    testRazorpayConnection
  );
  app.get("/api/payments/active-methods", getActivePaymentMethods);

  /* --------------------------------- Banners --------------------------------- */
  app.get("/api/banners/:position", getBannersByPosition);
  app.get("/api/admin/banners", authenticateToken, requireAdmin, getAllBanners);
  app.post("/api/admin/banners", authenticateToken, requireAdmin, createBanner);
  app.put("/api/admin/banners/:bannerId", authenticateToken, requireAdmin, updateBanner);
  app.delete("/api/admin/banners/:bannerId", authenticateToken, requireAdmin, deleteBanner);
  app.post("/api/admin/banners/upload", authenticateToken, requireAdmin, uploadBannerImage);
  app.post("/api/banners/initialize", initializeBanners);

  /* -------------------------------- Analytics -------------------------------- */
  app.post("/api/analytics/view/:propertyId", trackPropertyView);
  app.post("/api/analytics/inquiry/:propertyId", authenticateToken, trackPropertyInquiry);
  app.post("/api/analytics/phone/:propertyId", trackPhoneClick);
  app.get("/api/analytics/property/:propertyId", authenticateToken, getPropertyAnalytics);
  app.get("/api/analytics/seller", authenticateToken, getSellerAnalytics);
  app.get("/api/admin/analytics", authenticateToken, requireAdmin, getAdminAnalytics);

  /* ----------------------------------- App ----------------------------------- */
  app.get("/api/app/info", getAppInfo);
  app.get("/api/app/download", downloadAPK);
  app.post("/api/admin/app/upload", authenticateToken, requireAdmin, uploadAPK);
  app.get("/api/admin/app/stats", authenticateToken, requireAdmin, getDownloadStats);

  /* ---------------------------------- Chat ----------------------------------- */
  app.get("/api/chat/conversations", authenticateToken, getUserConversations);
  app.get(
    "/api/chat/conversations/:conversationId/messages",
    authenticateToken,
    getConversationMessages
  );
  app.post("/api/chat/messages", authenticateToken, sendMessage);
  app.post("/api/chat/start-property-conversation", authenticateToken, startPropertyConversation);
  app.get("/api/chat/unread-count", authenticateToken, getUnreadCount);

  /* ------------------------------ Testimonials ------------------------------- */
  app.get("/api/testimonials", getPublicTestimonials);
  app.get("/api/admin/testimonials", authenticateToken, requireAdmin, getAllTestimonials);
  app.post("/api/testimonials", authenticateToken, createTestimonial);
  app.put(
    "/api/admin/testimonials/:testimonialId",
    authenticateToken,
    requireAdmin,
    updateTestimonialStatus
  );
  app.delete(
    "/api/admin/testimonials/:testimonialId",
    authenticateToken,
    requireAdmin,
    deleteTestimonial
  );

  /* ------------------------------------ FAQ ---------------------------------- */
  app.get("/api/faqs", getPublicFAQs);
  app.get("/api/admin/faqs", authenticateToken, requireAdmin, getAllFAQs);
  app.post("/api/admin/faqs", authenticateToken, requireAdmin, createFAQ);
  app.put("/api/admin/faqs/:faqId", authenticateToken, requireAdmin, updateFAQ);
  app.delete("/api/admin/faqs/:faqId", authenticateToken, requireAdmin, deleteFAQ);
  app.post("/api/faqs/initialize", initializeFAQs);

  /* ----------------------------------- Blog ---------------------------------- */
  app.get("/api/blog", getPublicBlogPosts);
  app.get("/api/blog/:slug", getBlogPostBySlug);
  app.get("/api/admin/blog", authenticateToken, requireAdmin, getAllBlogPosts);
  app.post("/api/admin/blog", authenticateToken, requireAdmin, createBlogPost);
  app.put("/api/admin/blog/:postId", authenticateToken, requireAdmin, updateBlogPost);
  app.delete("/api/admin/blog/:postId", authenticateToken, requireAdmin, deleteBlogPost);

  /* --------------------------------- Reports --------------------------------- */
  app.get("/api/reports/reasons", getPublicReportReasons);
  app.get("/api/admin/reports/reasons", authenticateToken, requireAdmin, getAllReportReasons);
  app.post("/api/admin/reports/reasons", authenticateToken, requireAdmin, createReportReason);
  app.put(
    "/api/admin/reports/reasons/:reasonId",
    authenticateToken,
    requireAdmin,
    updateReportReason
  );
  app.delete(
    "/api/admin/reports/reasons/:reasonId",
    authenticateToken,
    requireAdmin,
    deleteReportReason
  );
  app.get("/api/admin/reports", authenticateToken, requireAdmin, getAllUserReports);
  app.post("/api/reports", authenticateToken, createUserReport);
  app.put(
    "/api/admin/reports/:reportId",
    authenticateToken,
    requireAdmin,
    updateUserReportStatus
  );
  app.post("/api/reports/initialize", initializeReportReasons);

  /* ------------------------------ User Packages ------------------------------ */
  app.get("/api/admin/user-packages", authenticateToken, requireAdmin, getAllUserPackages);
  app.get("/api/user-packages", authenticateToken, getUserPackages);
  app.post("/api/user-packages", authenticateToken, createUserPackage);
  app.put("/api/admin/user-packages/:packageId", authenticateToken, requireAdmin, updateUserPackageStatus);
  app.put("/api/user-packages/:packageId/usage", authenticateToken, updatePackageUsage);
  app.delete("/api/user-packages/:packageId", authenticateToken, cancelUserPackage);
  app.get("/api/admin/package-stats", authenticateToken, requireAdmin, getPackageStats);

  /* ---------------------------- CMS / Content routes ------------------------- */
  app.get("/api/content/pages", getPublishedPages);
  app.get("/api/content/pages/slug/:slug", getContentPageBySlug);
  app.post("/api/content/pages/:pageId/view", trackPageView);
  app.get("/api/admin/content", authenticateToken, requireAdmin, getAllContentPages);
  app.post("/api/admin/content", authenticateToken, requireAdmin, createContentPage);
  app.put("/api/admin/content/:pageId", authenticateToken, requireAdmin, updateContentPage);
  app.delete("/api/admin/content/:pageId", authenticateToken, requireAdmin, deleteContentPage);
  app.post("/api/content/initialize", initializeContentPages);

  /* ----------------------------- DB tests / Fix ------------------------------ */
  app.get("/api/test/database", testDatabase);
  app.get("/api/test/admin-user", testAdminUser);
  app.get("/api/test/admin-stats", testAdminStats);

  app.post("/api/fix/create-admin", forceCreateAdmin);
  app.get("/api/fix/admin-endpoints", fixAdminEndpoints);
  app.post("/api/fix/initialize-system", initializeSystemData);

  /* ---------------------------------- Staff ---------------------------------- */
  app.get("/api/admin/staff", authenticateToken, requireAdmin, getAllStaff);
  app.post("/api/admin/staff", authenticateToken, requireAdmin, createStaff);
  app.put("/api/admin/staff/:staffId", authenticateToken, requireAdmin, updateStaff);
  app.delete("/api/admin/staff/:staffId", authenticateToken, requireAdmin, deleteStaff);
  app.patch("/api/admin/staff/:staffId/status", authenticateToken, requireAdmin, updateStaffStatus);
  app.put("/api/admin/staff/:staffId/password", authenticateToken, requireAdmin, updateStaffPassword);
  app.get("/api/admin/roles", authenticateToken, requireAdmin, getRolesAndPermissions);

  /* -------------------------- Notifications (admin) -------------------------- */
  app.get("/api/admin/notifications", authenticateToken, requireAdmin, getAllNotifications);
  app.post("/api/admin/notifications/send", authenticateToken, requireAdmin, sendNotification);
  app.get("/api/admin/notifications/users", authenticateToken, requireAdmin, getUsers);
  app.get("/api/admin/notifications/:notificationId", authenticateToken, requireAdmin, getNotificationById);

  /* -------------------------- User notifications (mark) ---------------------- */
  app.put("/api/notifications/:notificationId/read", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).userId as string;
      const { notificationId } = req.params;
      const success = await pushNotificationService.markNotificationAsRead(userId, notificationId);
      if (!success) return res.status(404).json({ success: false, error: "Notification not found" });
      res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ success: false, error: "Failed to mark notification as read" });
    }
  });

  /* --------------------------------- Public sliders -------------------------- */
  app.get("/api/homepage-sliders/public", getActiveHomepageSliders);

  /* ------------------------------ Bank transfers ---------------------------- */
  app.get("/api/admin/bank-transfers", authenticateToken, requireAdmin, getAllBankTransfers);
  app.get("/api/admin/bank-transfers/stats", authenticateToken, requireAdmin, getBankTransferStats);
  app.get("/api/admin/bank-transfers/:transferId", authenticateToken, requireAdmin, getBankTransferById);
  app.put("/api/admin/bank-transfers/:transferId/status", authenticateToken, requireAdmin, updateBankTransferStatus);
  app.delete("/api/admin/bank-transfers/:transferId", authenticateToken, requireAdmin, deleteBankTransfer);

  app.post("/api/bank-transfers", authenticateToken, createBankTransfer);
  app.get("/api/user/bank-transfers", authenticateToken, getUserBankTransfers);
  app.post("/api/admin/bank-transfers/init-test-data", authenticateToken, requireAdmin, async (_req, res) => {
    await addBankTransferTestData();
    res.json({ success: true, message: "Bank transfer test data initialized" });
  });

  /* ----------------------------------- Seller ------------------------------- */
  app.get("/api/seller/properties", authenticateToken, getSellerProperties);
  app.get("/api/seller/notifications", authenticateToken, getSellerNotifications);
  app.put("/api/seller/notifications/:notificationId/read", authenticateToken, markNotificationAsRead);
  app.delete("/api/seller/notifications/:notificationId", authenticateToken, deleteSellerNotification);
  app.get("/api/seller/messages", authenticateToken, getSellerMessages);
  app.get("/api/seller/packages", authenticateToken, getSellerPackages);
  app.get("/api/seller/payments", authenticateToken, getSellerPayments);
  app.put("/api/seller/profile", authenticateToken, updateSellerProfile);
  app.put("/api/seller/change-password", authenticateToken, changeSellerPassword);
  app.post("/api/seller/purchase-package", authenticateToken, purchasePackage);
  app.get("/api/seller/stats", authenticateToken, getSellerStats);

  /* --------------------------------- Chatbot -------------------------------- */
  app.post("/api/chatbot", sendChatbotMessage);
  app.get("/api/admin/chat/conversations", authenticateToken, requireAdmin, getAdminChatConversations);
  app.get("/api/admin/chat/conversations/:conversationId/messages", authenticateToken, requireAdmin, getAdminChatMessages);
  app.post("/api/admin/chat/conversations/:conversationId/messages", authenticateToken, requireAdmin, sendAdminMessage);
  app.delete("/api/admin/chat/conversations/:conversationId", authenticateToken, requireAdmin, deleteChatConversation);
  app.get("/api/admin/chat/stats", authenticateToken, requireAdmin, getChatStatistics);

  /* --------------------------- Sample data utilities ------------------------- */
  app.post("/api/admin/sample-transactions", authenticateToken, requireAdmin, createSampleTransactions);
  app.delete("/api/admin/clear-transactions", authenticateToken, requireAdmin, clearAllTransactions);

  /* ----------------------- Push notification test/debug ---------------------- */
  app.post("/api/test/push-notification", authenticateToken, testPushNotification);
  app.get("/api/test/push-notification/stats", authenticateToken, getPushNotificationStats);
  app.get("/api/test/push-notification/user/:userId", authenticateToken, testUserConnection);

  /* ---------------------------------- Footer -------------------------------- */
  app.get("/api/footer/links", getActiveFooterLinks);
  app.get("/api/admin/footer-links", authenticateToken, requireAdmin, getAllFooterLinks);
  app.post("/api/admin/footer-links", authenticateToken, requireAdmin, createFooterLink);
  app.put("/api/admin/footer-links/:linkId", authenticateToken, requireAdmin, updateFooterLink);
  app.delete("/api/admin/footer-links/:linkId", authenticateToken, requireAdmin, deleteFooterLink);
  app.get("/api/footer/settings", getFooterSettings);
  app.get("/api/admin/footer-settings", authenticateToken, requireAdmin, getFooterSettings);
  app.put("/api/admin/footer-settings", authenticateToken, requireAdmin, updateFooterSettings);
  app.post("/api/footer/initialize", initializeFooterData);
  app.get("/api/footer/test", testFooterData);

  /* ------------------------- Custom fields management ------------------------ */
  app.get("/api/admin/custom-fields", authenticateToken, requireAdmin, getAllCustomFields);
  app.get("/api/admin/custom-fields/:fieldId", authenticateToken, requireAdmin, getCustomFieldById);
  app.post("/api/admin/custom-fields", authenticateToken, requireAdmin, createCustomField);
  app.put("/api/admin/custom-fields/:fieldId", authenticateToken, requireAdmin, updateCustomField);
  app.delete("/api/admin/custom-fields/:fieldId", authenticateToken, requireAdmin, deleteCustomField);
  app.put("/api/admin/custom-fields/:fieldId/status", authenticateToken, requireAdmin, updateCustomFieldStatus);
  app.put("/api/admin/custom-fields/reorder", authenticateToken, requireAdmin, reorderCustomFields);
  app.post("/api/custom-fields/initialize", initializeCustomFields);

  /* ---------------------------- WebSocket debug ------------------------------ */
  app.get("/api/debug/websocket-status", getWebSocketStatus);
  app.post("/api/debug/websocket-test", testWebSocketConnection);

  /* --------------------------------- Health --------------------------------- */
  app.get("/api/health", databaseHealthCheck as any, (req: any, res) => {
    const dbStatus = req.databaseStatus || { connected: false, responsive: false };
    res.json({
      status: dbStatus.connected && dbStatus.responsive ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
    });
  });

  /* ------------------------------ 404 + Errors ------------------------------- */
 app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("❌ Unhandled error:", err);
    const status = Number(err?.status || err?.statusCode) || 500;
    res.status(status).json({
      error: err?.message || "Internal Server Error",
      status,
    });
  });

  return app;
}

/* =========================================================================
   Extra service initializers – called from start-server.ts
   ========================================================================= */

export function initializePushNotifications(server: any) {
  pushNotificationService.initialize(server);
  console.log("📱 Push notification service initialized");
}

export function initializePackageSync(server: any) {
  packageSyncService.initialize(server);
  console.log("📦 Package sync service initialized");
}