/**
 * Bush Baby booking endpoint (Google Apps Script)
 *
 * What this script does:
 * - setupSheets(): creates Bookings + Archived sheets and header/data validation.
 * - doPost(e): receives form submissions, appends booking row, notifies manager + client.
 * - onEdit(e): when Status becomes Cancelled/Checked Out, row is moved to Archived.
 *
 * Required Script Properties:
 * - SHEET_ID                Google Sheet ID
 * - OWNER_EMAIL             Destination for new booking notifications (e.g. bushbabybb.info@gmail.com)
 *
 * Recommended security Script Property:
 * - WEBHOOK_SECRET          Shared secret expected from your server/proxy in payload.secret
 *
 * Optional Script Properties:
 * - BOOKING_SHEET_NAME      defaults to "Bookings"
 * - ARCHIVE_SHEET_NAME      defaults to "Archived"
 */

const HEADERS = [
  'Booking ID',
  'Created At',
  'Status',
  'Full Name',
  'Phone Number',
  'Email Address',
  'Check-in Date',
  'Check-out Date',
  'Adults',
  'Children',
  'Pets Included',
  'Message / Special Requests'
];

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled', 'Checked Out'];
const ACTIVE_STATUS = ['Pending', 'Confirmed'];
const ARCHIVE_STATUS = ['Cancelled', 'Checked Out'];

function setupSheets() {
  const config = getConfig_();
  const spreadsheet = SpreadsheetApp.openById(config.sheetId);

  const bookingSheet = ensureSheet_(spreadsheet, config.bookingSheetName);
  const archiveSheet = ensureSheet_(spreadsheet, config.archiveSheetName);

  ensureHeader_(bookingSheet, HEADERS);
  ensureHeader_(archiveSheet, HEADERS.concat(['Archived At', 'Archive Reason']));

  const validation = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_OPTIONS, true)
    .setAllowInvalid(false)
    .build();

  // Apply to entire status column from row 2 downward.
  bookingSheet.getRange(2, 3, Math.max(bookingSheet.getMaxRows() - 1, 1), 1).setDataValidation(validation);

  if (bookingSheet.getFilter()) bookingSheet.getFilter().remove();
  bookingSheet.getRange(1, 1, bookingSheet.getLastRow() || 1, HEADERS.length).createFilter();

  bookingSheet.setFrozenRows(1);
  archiveSheet.setFrozenRows(1);

  // Ensure status for existing rows is valid and defaults to Pending when empty.
  const lastRow = bookingSheet.getLastRow();
  if (lastRow > 1) {
    const statusRange = bookingSheet.getRange(2, 3, lastRow - 1, 1);
    const values = statusRange.getValues().map(([value]) => {
      const normalized = normalizeStatus_(value);
      if (ACTIVE_STATUS.includes(normalized) || ARCHIVE_STATUS.includes(normalized)) return [normalized];
      return ['Pending'];
    });
    statusRange.setValues(values);
  }
}

function doPost(e) {
  try {
    const config = getConfig_();
    const payload = parsePayload_(e);

    validateSecret_(payload.secret, config.webhookSecret);

    const data = normalizePayload_(payload);
    validateRequiredFields_(data);

    const spreadsheet = SpreadsheetApp.openById(config.sheetId);
    const bookingSheet = ensureSheet_(spreadsheet, config.bookingSheetName);
    const archiveSheet = ensureSheet_(spreadsheet, config.archiveSheetName);

    ensureHeader_(bookingSheet, HEADERS);
    ensureHeader_(archiveSheet, HEADERS.concat(['Archived At', 'Archive Reason']));

    const bookingId = Utilities.getUuid();
    const row = [
      bookingId,
      new Date(),
      'Pending',
      data.fullName,
      data.phone,
      data.email,
      data.checkIn,
      data.checkOut,
      data.adults,
      data.children,
      data.pets,
      data.message
    ];

    bookingSheet.appendRow(row);
    const newRowIndex = bookingSheet.getLastRow();
    applyStatusValidationToRow_(bookingSheet, newRowIndex);

    sendOwnerNotification_(config.ownerEmail, bookingId, data);
    sendGuestAcknowledgement_(data.email, data.fullName, bookingId);

    return jsonResponse_({ ok: true, bookingId: bookingId });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function onEdit(e) {
  if (!e || !e.range) return;

  const config = getConfig_();
  const range = e.range;
  const sheet = range.getSheet();

  if (sheet.getName() !== config.bookingSheetName) return;
  if (range.getRow() < 2 || range.getColumn() !== 3) return; // Status column only

  const newStatus = normalizeStatus_(range.getValue());
  if (!ARCHIVE_STATUS.includes(newStatus)) return;

  const spreadsheet = SpreadsheetApp.openById(config.sheetId);
  const archiveSheet = ensureSheet_(spreadsheet, config.archiveSheetName);
  ensureHeader_(archiveSheet, HEADERS.concat(['Archived At', 'Archive Reason']));

  const rowNumber = range.getRow();
  const rowValues = sheet.getRange(rowNumber, 1, 1, HEADERS.length).getValues()[0];

  // Skip blank rows.
  const hasData = rowValues.some((cell) => String(cell).trim() !== '');
  if (!hasData) return;

  const archiveRow = rowValues.concat([new Date(), newStatus]);
  archiveSheet.appendRow(archiveRow);
  sheet.deleteRow(rowNumber);

  // Optional: keep only active statuses visible when filter exists.
  const filter = sheet.getFilter();
  if (filter) {
    const criteria = SpreadsheetApp.newFilterCriteria().setVisibleValues(ACTIVE_STATUS).build();
    filter.setColumnFilterCriteria(3, criteria);
  }
}

function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

function getConfig_() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('SHEET_ID');
  const ownerEmail = props.getProperty('OWNER_EMAIL');

  if (!sheetId) throw new Error('Missing script property: SHEET_ID');
  if (!ownerEmail) throw new Error('Missing script property: OWNER_EMAIL');

  return {
    sheetId: sheetId,
    ownerEmail: ownerEmail,
    webhookSecret: props.getProperty('WEBHOOK_SECRET') || '',
    bookingSheetName: props.getProperty('BOOKING_SHEET_NAME') || 'Bookings',
    archiveSheetName: props.getProperty('ARCHIVE_SHEET_NAME') || 'Archived'
  };
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('Empty request body');
  let parsed;
  try {
    parsed = JSON.parse(e.postData.contents);
  } catch (err) {
    throw new Error('Body must be valid JSON');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('JSON body must be an object');
  return parsed;
}

function normalizePayload_(payload) {
  return {
    fullName: sanitizeText_(payload.fullName),
    phone: sanitizeText_(payload.phone),
    email: sanitizeText_(payload.email).toLowerCase(),
    checkIn: sanitizeText_(payload.checkIn),
    checkOut: sanitizeText_(payload.checkOut),
    adults: String(payload.adults || '').trim(),
    children: String(payload.children || '').trim(),
    pets: sanitizeText_(payload.pets || 'No'),
    message: sanitizeText_(payload.message || '')
  };
}

function validateRequiredFields_(data) {
  const required = ['fullName', 'phone', 'email', 'checkIn', 'checkOut', 'adults', 'children', 'pets'];
  const missing = required.filter((key) => !String(data[key] || '').trim());
  if (missing.length) throw new Error('Missing fields: ' + missing.join(', '));

  if (!/^\S+@\S+\.\S+$/.test(data.email)) throw new Error('Invalid email address');

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  if (Number.isNaN(checkIn.valueOf()) || Number.isNaN(checkOut.valueOf()) || checkOut <= checkIn) {
    throw new Error('Invalid check-in/check-out date range');
  }

  if (!/^\d+$/.test(data.adults) || Number(data.adults) < 1) throw new Error('Adults must be 1 or greater');
  if (!/^\d+$/.test(data.children) || Number(data.children) < 0) throw new Error('Children must be 0 or greater');
}

function validateSecret_(incomingSecret, expectedSecret) {
  if (!expectedSecret) return; // Optional hardening toggle
  if (!incomingSecret || incomingSecret !== expectedSecret) {
    throw new Error('Unauthorized request');
  }
}

function sendOwnerNotification_(ownerEmail, bookingId, data) {
  const subject = 'New Bush Baby booking enquiry: ' + data.fullName;
  const body = [
    'New booking enquiry received.',
    '',
    'Booking ID: ' + bookingId,
    'Name: ' + data.fullName,
    'Phone: ' + data.phone,
    'Email: ' + data.email,
    'Check-in: ' + data.checkIn,
    'Check-out: ' + data.checkOut,
    'Adults: ' + data.adults,
    'Children: ' + data.children,
    'Pets: ' + data.pets,
    'Message: ' + (data.message || 'None')
  ].join('\n');

  MailApp.sendEmail({
    to: ownerEmail,
    subject: subject,
    body: body
  });
}

function sendGuestAcknowledgement_(guestEmail, fullName, bookingId) {
  const subject = 'Bush Baby enquiry received';
  const body = [
    'Hi ' + fullName + ',',
    '',
    'Thank you for your booking enquiry at Bush Baby.',
    'Zelda will be in contact regarding availability shortly.',
    '',
    'Reference: ' + bookingId,
    '',
    'Kind regards,',
    'Bush Baby'
  ].join('\n');

  MailApp.sendEmail({
    to: guestEmail,
    subject: subject,
    body: body
  });
}

function ensureSheet_(spreadsheet, name) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  return sheet;
}

function ensureHeader_(sheet, expectedHeader) {
  const headerRange = sheet.getRange(1, 1, 1, expectedHeader.length);
  const currentHeader = headerRange.getValues()[0].map((item) => String(item || '').trim());
  const same = expectedHeader.every((label, index) => currentHeader[index] === label);

  if (!same) {
    headerRange.setValues([expectedHeader]);
    headerRange.setFontWeight('bold');
    sheet.autoResizeColumns(1, expectedHeader.length);
  }
}

function applyStatusValidationToRow_(sheet, row) {
  const validation = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_OPTIONS, true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange(row, 3).setDataValidation(validation);
}

function normalizeStatus_(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'pending') return 'Pending';
  if (normalized === 'confirmed') return 'Confirmed';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'Cancelled';
  if (normalized === 'checked out' || normalized === 'checked-out' || normalized === 'checkedout') return 'Checked Out';
  return 'Pending';
}

function sanitizeText_(value) {
  return String(value == null ? '' : value).replace(/[<>]/g, '').trim();
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
