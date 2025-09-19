// api/conf.js
module.exports = async (req, res) => {
  try {
    return res.status(200).json({ templateId: process.env.TEMPLATE_ID || "" });
  } catch (e) {
    return res.status(500).json({ templateId: "" });
  }
};
