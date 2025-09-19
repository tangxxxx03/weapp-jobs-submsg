const memory = new Map();
async function kvSet(key, value, ttlSec){
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL + "/set/" + encodeURIComponent(key);
    const body = { value: JSON.stringify(value), ex: ttlSec };
    const r = await fetch(url, { method:"POST", headers:{ Authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, "content-type":"application/json" }, body: JSON.stringify(body) });
    return await r.json();
  } else {
    memory.set(key, { value, expireAt: Date.now() + ttlSec*1000 });
    return { result: "ok" };
  }
}
async function kvGet(key){
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL + "/get/" + encodeURIComponent(key);
    const r = await fetch(url, { headers:{ Authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } });
    const j = await r.json();
    if (!j || !j.result) return null;
    try { return JSON.parse(j.result); } catch { return null; }
  } else {
    const v = memory.get(key);
    if (!v) return null;
    if (Date.now() > v.expireAt) { memory.delete(key); return null; }
    return v.value;
  }
}
module.exports = { kvSet, kvGet };
