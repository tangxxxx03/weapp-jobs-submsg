const { kvGet } = require("./_kv");
module.exports = async (req, res) => {
  try{
    if ((req.headers["x-app-token"]||"") !== process.env.APP_TOKEN) return res.status(401).json({ ok:0, msg:"Auth failed" });
    const url = new URL(req.url, "http://x");
    const rid = url.searchParams.get("rid")||"";
    const data = await kvGet("inbox:"+rid);
    if (!data) return res.status(404).json({ ok:0, msg:"not found" });
    return res.status(200).json({ ok:1, data: { jobTitle:data.jobTitle, name:data.name, phone:data.phone, email:data.email, portfolioLink:data.portfolioLink, time:data.time, hasPortfolio: !!(data.portfolio && data.portfolio.base64) } });
  }catch(e){ console.error(e); return res.status(500).json({ ok:0, msg:e.message }); }
};
