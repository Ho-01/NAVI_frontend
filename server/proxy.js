const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5174;

app.get("/api/tour/health", (req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.TOURAPI_KEY) });
});

app.get("/api/tour/detailIntro2", async (req, res) => {
  try {
    const key = process.env.TOURAPI_KEY;
    if (!key) return res.status(500).json({ error: "TOURAPI_KEY missing" });

    const qs = new URLSearchParams({
      serviceKey: key,
      MobileOS: "ETC",
      MobileApp: "OutdoorEscape",
      _type: "json",
      contentId: req.query.contentId || "",
      contentTypeId: req.query.contentTypeId || "",
    });

    const url = "https://apis.data.go.kr/B551011/KorService2/detailIntro2?" + qs.toString();
    console.log("[proxy] fetch:", url);

    const r = await fetch(url, { headers: { accept: "application/json" } });
    const ct = r.headers.get("content-type") || "";
    const text = await r.text();
    console.log("[proxy] status:", r.status, ct);
    console.log("[proxy] body head:", text.slice(0, 200)); // ← 이건 핸들러 내부에서만!

    if (!ct.includes("application/json")) {
      return res.status(r.status).type("text/plain").send(text);
    }
    return res.status(r.status).json(JSON.parse(text));
  } catch (e) {
    console.error("[proxy] ERR:", e);
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("TourAPI proxy on :" + PORT);
  console.log("[proxy] hasKey:", Boolean(process.env.TOURAPI_KEY));
});
