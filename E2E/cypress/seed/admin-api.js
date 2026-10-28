// Small client for the Shopware Admin API, used by seed.js.
// No dependencies (plain http/https), so it runs on the Node of the Cypress image without an npm install.
const http = require("http");
const https = require("https");

const BASE_URL = process.env.SHOPWARE_URL || "http://shopware.test";

function send(method, path, { body, headers = {} } = {}) {
  const url = new URL(path, BASE_URL);
  const client = url.protocol === "https:" ? https : http;
  const payload = body === undefined ? undefined : JSON.stringify(body);
  const allHeaders = { ...headers };
  if (payload !== undefined) {
    allHeaders["Content-Type"] = "application/json";
    allHeaders["Content-Length"] = Buffer.byteLength(payload);
  }

  return new Promise((resolve, reject) => {
    const req = client.request(url, { method, headers: allHeaders }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error(`${method} ${url} timed out`)));
    if (payload !== undefined) req.write(payload);
    req.end();
  });
}

class AdminApi {
  async token() {
    if (this.auth && this.auth.expiresAt > Date.now() + 30000) {
      return this.auth.accessToken;
    }
    const res = await send("POST", "/api/oauth/token", {
      body: {
        grant_type: "password",
        client_id: "administration",
        scopes: "write",
        username: process.env.SHOPWARE_ADMIN_USER || "admin",
        password: process.env.SHOPWARE_ADMIN_PASSWORD || "shopware",
      },
    });
    if (res.status !== 200) {
      throw new Error(`Admin login failed (${res.status}): ${res.body.slice(0, 500)}`);
    }
    const json = JSON.parse(res.body);
    this.auth = { accessToken: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
    return this.auth.accessToken;
  }

  async request(method, path, body) {
    const res = await send(method, `/api/${path.replace(/^\//, "")}`, {
      body,
      headers: { Accept: "application/json", Authorization: `Bearer ${await this.token()}` },
    });
    if (res.status >= 400) {
      throw new Error(`${method} ${path} failed (${res.status}): ${res.body.slice(0, 1000)}`);
    }
    return res.body ? JSON.parse(res.body) : null;
  }

  async search(entity, criteria) {
    return (await this.request("POST", `/search/${entity}`, criteria)).data;
  }

  // first entity where field equals value, fails if there is none
  async findOne(entity, field, value, criteria = {}) {
    const [found] = await this.search(entity, {
      ...criteria,
      limit: 1,
      filter: [{ type: "equals", field, value }, ...(criteria.filter || [])],
    });
    if (!found) {
      throw new Error(`No ${entity} with ${field} = "${value}" found`);
    }
    return found;
  }

  // upserts in one request; the ids in the payload decide between insert and update
  upsert(entity, payload) {
    return this.request("POST", "/_action/sync", [{ key: entity, action: "upsert", entity, payload }]);
  }
}

// storefront page without authentication, for waiting until the seeded data is visible
function fetchPage(path) {
  return send("GET", path, { headers: { Accept: "text/html" } });
}

module.exports = { AdminApi, fetchPage };
