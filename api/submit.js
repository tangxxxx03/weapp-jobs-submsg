const { kvSet } = require("./_kv");
function assert(c, m, code=400){ if(!c){ const e=new Error(m); e.statusCode=code; throw e; } }
function safeStr(v, n){ return (v||"").toString().slice(0,n); }
function rand(n=24){ const s="abcdefghijklmnopqrstuvwxyz0123456789"; let r=""; for(let i=0;i<n;i++) r+=s[Math.floor(Math.random()*s.length)]; return r; }

module.exports = async (req, res) => {
  try{
    if (req.method!=="POST") return res.status(405).end();
    if ((req.headers["x-app-token"]||"") !== process.env.APP_TOKEN) return res.status(401).json({ ok:0, msg:"Auth failed" });
    if (!((req.headers["content-type"]||"").includes("application/json"))) return res.status(400).json({ ok:0, msg:"Bad content-type" });

    let s=""; await new Promise(r=>{ req.on("data",c=>s+=c); req.on("end",r); });
    let d={}; try{ d=JSON.parse(s||"{}"); }catch{}
    const jobTitle = safeStr(d.jobTitle,100);
    const name = safeStr(d.name,50);
    const phone = safeStr(d.phone,50);
    const email = safeStr(d.email,100);
    const portfolioLink = safeStr(d.portfolioLink,500);
    const publisherOpenid = safeStr(d.publisherOpenid,128);
    assert(publisherOpenid, "publisherOpenid required");
    const resumeFilename = safeStr(d.resumeFilename||"resume",128);
    const resumeBase64 = (d.resumeBase64||"").toString();
    assert(resumeBase64, "No resume file");
    const portfolioFilename = safeStr(d.portfolioFilename||"",128);
    const portfolioBase64 = (d.portfolioBase64||"").toString();

    const maxB64 = 10*1024*1024*1.37;
    assert(resumeBase64.length < maxB64, "resume too large");
    assert(portfolioBase64.length < (maxB64*1.5), "portfolio too large");

    const rid = rand(24);
    const payload = { jobTitle, name, phone, email, portfolioLink,
      resume: { filename: resumeFilename, base64: resumeBase64 },
      portfolio: { filename: portfolioFilename, base64: portfolioBase64 },
      time: new Date().toISOString() };
    await kvSet("inbox:"+rid, payload, Number(process.env.TTL_SECONDS || 86400));

    const tkResp = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.APPID}&secret=${process.env.APPSECRET}`);
    const tkJson = await tkResp.json();
    assert(tkJson.access_token, "get token fail", 500);
    const tpl = process.env.TEMPLATE_ID; assert(tpl, "TEMPLATE_ID missing", 500);

    const msgBody = { touser: publisherOpenid, template_id: tpl, page: `pages/inbox/inbox?rid=${encodeURIComponent(rid)}`, data: {
      thing1: { value: jobTitle ? `新的投递：${jobTitle}` : "新的投递" },
      name1:  { value: name || "未留名" },
      time2:  { value: new Date().toLocaleString() },
      thing4: { value: `电话：${phone||"未留"}，点此查看` }
    }};
    const sendResp = await fetch(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${tkJson.access_token}`, {
      method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(msgBody)
    });
    const sendJson = await sendResp.json();
    assert(sendJson.errcode===0, "send fail: "+sendJson.errmsg, 500);
    return res.status(200).json({ ok:1, rid });
  }catch(e){ console.error(e); return res.status(e.statusCode||500).json({ ok:0, msg: e.message||"Server error" }); }
};
