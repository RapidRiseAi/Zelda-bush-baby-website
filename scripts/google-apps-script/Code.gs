/**
 * Bush Baby enquiry endpoint for Google Apps Script.
 *
 * Setup:
 * 1) Create a Google Sheet and set SHEET_NAME.
 * 2) Set SCRIPT properties: MANAGER_EMAIL and SHEET_ID.
 * 3) Deploy as Web App (execute as Me, access Anyone).
 * 4) Add deployed URL to PUBLIC_ENQUIRY_ENDPOINT.
 */

const SHEET_NAME = 'Enquiries';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const required = ['fullName', 'phone', 'email', 'checkIn', 'checkOut', 'adults', 'children', 'pets'];
    const missing = required.filter((key) => !String(body[key] ?? '').trim());
    if (missing.length) return jsonResponse({ ok: false, error: `Missing fields: ${missing.join(', ')}` }, 400);

    const props = PropertiesService.getScriptProperties();
    const sheetId = props.getProperty('SHEET_ID');
    const managerEmail = props.getProperty('MANAGER_EMAIL');
    if (!sheetId || !managerEmail) return jsonResponse({ ok: false, error: 'Missing script properties' }, 500);

    const sheet = getSheet_(sheetId);
    const row = [
      new Date(),
      body.fullName,
      body.phone,
      body.email,
      body.checkIn,
      body.checkOut,
      body.adults,
      body.children,
      body.pets,
      body.message || ''
    ];
    sheet.appendRow(row);

    const subject = `New Bush Baby enquiry: ${body.fullName}`;
    const htmlBody = `
      <h3>New Bush Baby Enquiry</h3>
      <p><strong>Name:</strong> ${sanitize_(body.fullName)}</p>
      <p><strong>Phone:</strong> ${sanitize_(body.phone)}</p>
      <p><strong>Email:</strong> ${sanitize_(body.email)}</p>
      <p><strong>Check-in:</strong> ${sanitize_(body.checkIn)}</p>
      <p><strong>Check-out:</strong> ${sanitize_(body.checkOut)}</p>
      <p><strong>Adults:</strong> ${sanitize_(body.adults)}</p>
      <p><strong>Children:</strong> ${sanitize_(body.children)}</p>
      <p><strong>Pets:</strong> ${sanitize_(body.pets)}</p>
      <p><strong>Message:</strong> ${sanitize_(body.message || 'None')}</p>
    `;

    MailApp.sendEmail({ to: managerEmail, subject, htmlBody });
    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
}

function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

function getSheet_(sheetId) {
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Full Name', 'Phone', 'Email', 'Check-in', 'Check-out', 'Adults', 'Children', 'Pets', 'Message']);
  }
  return sheet;
}

function sanitize_(value) {
  return String(value).replace(/[<>&]/g, '');
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
