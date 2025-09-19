module.exports = async (req, res) => {
  try{
    if (req.method !== "POST") return res.status(405).end();
    let s=""; await new Promise(r=>{ req.on("data",c=>s+=c); req.on("end",r); });
    let d={}; try{ d=JSON.parse(s||"{}"); }catch{}
    if (!d.code) return res.status(400).json({ ok:0, msg:"no code" });

    const qs = new URLSearchParams({ appid: process.env.APPID, secret: process.env.APPSECRET, js_code: d.code, grant_type: "authorization_code" });
    const resp = await fetch("https://api.weixin.qq.com/sns/jscode2session?"+qs);
    const json = await resp.json();
    if (!json.openid) return res.status(400).json({ ok:0, msg:"jscode2session fail" });
    return res.status(200).json({ ok:1, openid: json.openid });
  }catch(e){ console.error(e); return res.status(500).json({ ok:0, msg: e.message }); }
};
