// /api/uploadImage.js  —— 微信 uploadFile → Vercel → COS
const COS = require('cos-nodejs-sdk-v5');
const formidable = require('formidable');
const crypto = require('crypto');

module.exports.config = { api: { bodyParser: false } };

const { COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION, PUBLIC_BASE } = process.env;
const cos = new COS({ SecretId: COS_SECRET_ID, SecretKey: COS_SECRET_KEY });

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, msg:'Method Not Allowed' });

  const form = formidable({ multiples:false, keepExtensions:true, maxFileSize: 3*1024*1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ ok:false, msg:'解析失败' });
    const file = files?.file;
    if (!file?.filepath) return res.status(400).json({ ok:false, msg:'缺少文件' });

    const ext = (file.originalFilename || '').split('.').pop() || 'jpg';
    const key = `qrcodes/${new Date().toISOString().slice(0,10)}/${crypto.randomBytes(6).toString('hex')}.${ext}`;

    try {
      await cos.putObject({
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        Key: key,
        Body: require('fs').createReadStream(file.filepath),
        ContentType: file.mimetype || 'image/jpeg'
      });
      const base = (PUBLIC_BASE || `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`).replace(/\/$/, '');
      const url = `${base}/${key}`;
      return res.status(200).json({ ok:true, url });
    } catch (e) {
      console.error('COS 上传失败', e);
      return res.status(500).json({ ok:false, msg:'上传失败' });
    }
  });
};
