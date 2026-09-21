/**
 * GanpatiLive — private Visarjan registration backend
 * Bound to the Google Sheet used for registrations.
 */

const SHEET_NAME = "Registrations";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("This Apps Script must be created from the registration Google Sheet.");
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Instagram", "Private Code", "Registered At", "Timestamp"]);
  }
  return sheet;
}

function doGet() {
  return json_({ ok: true, service: "GanpatiLive registration backend" });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const raw = e && e.postData ? e.postData.contents : "{}";
    const payload = JSON.parse(raw || "{}");
    if (payload.action !== "register") return json_({ok:false,error:"Invalid action"});

    const instagram = String(payload.instagram || "")
      .trim().replace(/^@+/, "").replace(/\s+/g, "");
    if (!/^[A-Za-z0-9._]{1,30}$/.test(instagram)) {
      return json_({ok:false,error:"Invalid Instagram username"});
    }

    lock.waitLock(10000);
    const sheet = getSheet_();
    const rows = sheet.getDataRange().getValues();
    const normalized = instagram.toLowerCase();

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).replace(/^@+/, "").toLowerCase() === normalized) {
        return json_({ok:true, code:String(rows[i][1]), existing:true});
      }
    }

    let code;
    do {
      code = makeCode_();
    } while (rows.some(row => String(row[1]) === code));

    const now = new Date();
    sheet.appendRow(["@" + instagram, code, now, now.getTime()]);
    return json_({ok:true, code:code, existing:false});
  } catch (err) {
    return json_({ok:false,error:String(err)});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function makeCode_() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "GL-" + out.slice(0,4) + "-" + out.slice(4);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
