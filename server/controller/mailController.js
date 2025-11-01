const { sendMail } = require('../services/mailService');

// POST /api/mail/send
async function sendMailController(req, res, next) {
  try {
    const { to, subject, text, html, from } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ success: false, message: 'Missing required fields: to, subject' });
    }

    const result = await sendMail({ to, subject, text, html, from });

    res.json({ success: true, message: 'Email sent', data: { info: result.info, previewUrl: result.previewUrl } });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMailController };
