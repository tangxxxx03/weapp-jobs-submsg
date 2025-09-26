// api/uploadImage.js
import COS from 'cos-nodejs-sdk-v5';
import formidable from 'formidable';

export const config = { api: { bodyParser: false } };

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const BUCKET = process.env.COS_BUCKET;
const REGION = process.env.COS_REGION;
const PUBLIC_BASE = process.env.PUBLIC_BASE; // https://<bucket>.cos.<region>.myqcloud.com

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok:false, msg:'method_not_allowed' });
  }
  try {
    const { files } = await new Promise((resolve, reject) => {
      const form = formidable({ multiples:false, maxFileSize: 5*1024*1024 });
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });
    const file = files?.file;
    if (!file) return res.status(400).json({ ok:false, msg:'no_file' });

    const ext = (file.originalFilename || 'qr').split('.').pop().toLowerCase();
    const d = new Date();
    const key = `qrcodes/${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: require('fs').createReadStream(file.filepath),
        ContentType: file.mimetype || 'application/octet-stream',
        ACL: 'public-read'
      }, (err, data) => err ? reject(err) : resolve(data));
    });

    res.status(200).json({ ok:true, url: `${PUBLIC_BASE}/${key}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, msg:'upload_fail', err: String(e?.message || e) });
  }
}
