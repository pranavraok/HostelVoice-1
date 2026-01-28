"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = exports.adminRoutes = exports.analyticsRoutes = exports.notificationsRoutes = exports.residentsRoutes = exports.lostFoundRoutes = exports.announcementsRoutes = exports.issuesRoutes = void 0;
var issues_routes_1 = require("./issues.routes");
Object.defineProperty(exports, "issuesRoutes", { enumerable: true, get: function () { return __importDefault(issues_routes_1).default; } });
var announcements_routes_1 = require("./announcements.routes");
Object.defineProperty(exports, "announcementsRoutes", { enumerable: true, get: function () { return __importDefault(announcements_routes_1).default; } });
var lostfound_routes_1 = require("./lostfound.routes");
Object.defineProperty(exports, "lostFoundRoutes", { enumerable: true, get: function () { return __importDefault(lostfound_routes_1).default; } });
var residents_routes_1 = require("./residents.routes");
Object.defineProperty(exports, "residentsRoutes", { enumerable: true, get: function () { return __importDefault(residents_routes_1).default; } });
var notifications_routes_1 = require("./notifications.routes");
Object.defineProperty(exports, "notificationsRoutes", { enumerable: true, get: function () { return __importDefault(notifications_routes_1).default; } });
var analytics_routes_1 = require("./analytics.routes");
Object.defineProperty(exports, "analyticsRoutes", { enumerable: true, get: function () { return __importDefault(analytics_routes_1).default; } });
var admin_routes_1 = require("./admin.routes");
Object.defineProperty(exports, "adminRoutes", { enumerable: true, get: function () { return __importDefault(admin_routes_1).default; } });
var upload_routes_1 = require("./upload.routes");
Object.defineProperty(exports, "uploadRoutes", { enumerable: true, get: function () { return __importDefault(upload_routes_1).default; } });
//# sourceMappingURL=index.js.map