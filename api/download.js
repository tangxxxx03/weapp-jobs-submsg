const { kvGet } = require("./_kv");
module.exports = async (req, res) => {
  try{
    if ((req.headers["x-app-token"]||"") !== process.env.APP_TOKEN) return res.status(401).end("Auth failed");
    const url = new URL(req.url, "http://x");
    const rid = url.searchParams.get("rid")||"";
    const type = url.searchParams.get("type")||"resume";
    const data = await kvGet("inbox:"+rid);
    if (!data) { res.statusCode=404; return res.end("not found"); }
    const which = type==="portfolio" ? data.portfolio : data.resume;
    if (!which || !which.base64) { res.statusCode=404; return res.end("not found"); }
    const buf = Buffer.from(which.base64, "base64");
    const fname = which.filename || (type+".bin");
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(fname)}`);
    return res.end(buf);
  }catch(e){ console.error(e); res.statusCode=500; res.end("server error"); }
};
