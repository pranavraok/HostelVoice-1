"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserClient = exports.supabaseAdmin = exports.env = void 0;
var env_1 = require("./env");
Object.defineProperty(exports, "env", { enumerable: true, get: function () { return env_1.env; } });
var supabaseClient_1 = require("./supabaseClient");
Object.defineProperty(exports, "supabaseAdmin", { enumerable: true, get: function () { return supabaseClient_1.supabaseAdmin; } });
Object.defineProperty(exports, "createUserClient", { enumerable: true, get: function () { return supabaseClient_1.createUserClient; } });
//# sourceMappingURL=index.js.map