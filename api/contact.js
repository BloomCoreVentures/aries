/* ==========================================================================
   ARIES GROUP — contact form endpoint (Vercel Function, Node.js runtime)
   POST /api/contact  (multipart/form-data from the site form)
   Sends the request to the team inbox via Resend (https://resend.com).

   Environment variables (Vercel → Project → Settings → Environment Variables):
     ARIES_RESEND_API_KEY  required  Resend API key
     ARIES_CONTACT_TO      optional  inbox, default alex.ariesgroup@gmail.com
     ARIES_CONTACT_FROM    optional  sender, default "ARIES Website <onboarding@resend.dev>"
                                     (use an address on a domain verified in Resend)
   ========================================================================== */

const API_KEY = process.env.ARIES_RESEND_API_KEY;
const TO = process.env.ARIES_CONTACT_TO || 'alex.ariesgroup@gmail.com';
const FROM = process.env.ARIES_CONTACT_FROM || 'ARIES Website <onboarding@resend.dev>';

// Vercel caps a function request body at 4.5 MB — keep the file under that
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const FILE_EXT = /\.(pdf|docx?|pptx?|key|txt|rtf|png|jpe?g|zip)$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM_RE = /^@?[A-Za-z0-9_]{5,32}$/;
const INTERESTS = ['Brand Partnership', 'Talent Management', 'Campaign', 'Other'];

const json = (status, body) => Response.json(body, { status });

const text = (form, name, max) => String(form.get(name) ?? '').trim().slice(0, max);

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

export async function POST(request) {
  if (!API_KEY) {
    console.error('contact: ARIES_RESEND_API_KEY is not set');
    return json(500, { ok: false, error: 'not_configured' });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'bad_request' });
  }

  // honeypot: real visitors never see this field
  if (text(form, 'hp_check', 200)) return json(200, { ok: true });

  const data = {
    firstName: text(form, 'firstName', 100),
    lastName: text(form, 'lastName', 100),
    email: text(form, 'email', 200),
    telegram: text(form, 'telegram', 40).replace(/^@?/, '@'),
    request: text(form, 'request', 5000),
    type: ['creator', 'company'].includes(form.get('type')) ? form.get('type') : '',
    interests: form.getAll('interests').filter((v) => INTERESTS.includes(v)),
    page: text(form, 'page', 200),
  };
  if (data.telegram === '@') data.telegram = '';

  const invalid = [];
  if (!data.firstName) invalid.push('firstName');
  if (!data.lastName) invalid.push('lastName');
  if (!EMAIL_RE.test(data.email)) invalid.push('email');
  if (data.telegram && !TELEGRAM_RE.test(data.telegram)) invalid.push('telegram');
  if (!data.request) invalid.push('request');
  if (invalid.length) return json(422, { ok: false, error: 'invalid', fields: invalid });

  const attachments = [];
  const file = form.get('resume');
  if (file && typeof file === 'object' && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return json(413, { ok: false, error: 'file_too_large' });
    if (!FILE_EXT.test(file.name)) return json(422, { ok: false, error: 'file_type' });
    attachments.push({
      filename: file.name.replace(/[^\w.\- ()]/g, '_'),
      content: Buffer.from(await file.arrayBuffer()).toString('base64'),
    });
  }

  const typeLabel = { creator: 'Creator', company: 'Company' }[data.type] || '';
  const name = `${data.firstName} ${data.lastName}`;
  const rows = [
    ['Type', typeLabel],
    ['Name', name],
    ['Email', data.email],
    ['Telegram', data.telegram],
    ['Interested in', data.interests.join(', ')],
    ['Attachment', attachments[0]?.filename || ''],
    ['Page', data.page],
  ].filter(([, v]) => v);

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">
      <h2 style="margin:0 0 16px">New request from the website${typeLabel ? ` — ${typeLabel}` : ''}</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows.map(([k, v]) => `<tr><td style="color:#666;vertical-align:top">${k}</td><td><b>${escapeHtml(v)}</b></td></tr>`).join('')}
      </table>
      <h3 style="margin:20px 0 8px">Request</h3>
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(data.request)}</p>
    </div>`;
  const plain = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nRequest:\n${data.request}`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: data.email,
      subject: `ARIES website: ${typeLabel ? `${typeLabel} — ` : ''}${name}`,
      html,
      text: plain,
      attachments,
    }),
  });

  if (!res.ok) {
    console.error('contact: Resend error', res.status, await res.text());
    return json(502, { ok: false, error: 'send_failed' });
  }
  return json(200, { ok: true });
}
