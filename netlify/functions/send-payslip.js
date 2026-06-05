const { Resend } = require('resend');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Check API key is configured
  if (!process.env.RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY is not set in Netlify environment variables.' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { to, name, month, htmlBody } = payload;

  if (!to || !htmlBody) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: to, htmlBody' }) };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'payroll@perfectsecurity.in',
      to:   to,
      subject: `Your Payslip for ${month || 'this month'} — Perfect Security Services`,
      html: htmlBody,
    });

    if (error) {
      return { statusCode: 422, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: data?.id }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
