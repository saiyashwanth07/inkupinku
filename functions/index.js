const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Define Configuration Parameters
const sheetId = defineString("LEADS_SHEET_ID");
const adminEmail = defineString("LEADS_ADMIN_EMAIL", { 
  default: "yasaswini.machavaram@dreamsanddegrees.com" 
});
const smtpEmail = defineString("LEADS_SMTP_EMAIL");

// Define Secrets
const googleServiceAccountKey = defineSecret("GOOGLE_SERVICE_ACCOUNT_KEY");
const smtpPassword = defineSecret("SMTP_PASSWORD");

/**
 * Cloud Function triggered on creation of a new lead in Firestore.
 */
exports.processNewLead = onDocumentCreated(
  {
    document: "leads/{leadId}",
    secrets: [googleServiceAccountKey, smtpPassword],
    // Optional: Configure region and memory based on needs
    region: "asia-south1",
    memory: "256MiB"
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event.");
      return;
    }

    const leadData = snapshot.data();
    const leadId = event.params.leadId;

    // 1. Idempotency Check: Prevent duplicate processing
    if (leadData.sheetSynced === true || leadData.emailSent === true || leadData.processedAt) {
      console.log(`Lead ${leadId} has already been processed. Skipping.`);
      return;
    }

    console.log(`Processing new lead: ${leadId}`);

    // Retrieve sensitive values from Secret Manager
    const serviceAccountJsonStr = googleServiceAccountKey.value();
    const emailPassword = smtpPassword.value();
    
    // Retrieve normal config
    const targetSheetId = sheetId.value();
    const recipientEmail = adminEmail.value();
    const senderEmail = smtpEmail.value();

    let sheetSuccess = false;
    let emailSuccess = false;

    // ==========================================
    // TASK A: Sync to Google Sheets
    // ==========================================
    try {
      if (!serviceAccountJsonStr || !targetSheetId) {
        throw new Error("Missing Google Service Account JSON or Sheet ID.");
      }

      const serviceAccount = JSON.parse(serviceAccountJsonStr);
      
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key,
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });

      // Format row based on schema: [Timestamp, Name, Mobile, University, Action, Lead ID]
      // Adjust these based on your exact Google Sheet columns
      const row = [
        leadData.timestamp || new Date().toISOString(),
        leadData.name || "N/A",
        leadData.mobile || "N/A",
        leadData.university || "N/A",
        leadData.action || "N/A",
        leadId
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: targetSheetId,
        range: "Sheet1!A:F", // Adjust "Sheet1" if your sheet name is different
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });

      console.log(`Successfully synced lead ${leadId} to Google Sheets.`);
      sheetSuccess = true;
    } catch (error) {
      console.error(`Error syncing lead ${leadId} to Google Sheets:`, error);
    }

    // ==========================================
    // TASK B: Send Email Notification
    // ==========================================
    try {
      if (!emailPassword || !senderEmail) {
        throw new Error("Missing SMTP credentials.");
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: senderEmail,
          pass: emailPassword,
        },
      });

      const mailOptions = {
        from: `AP EAPCET Predictor <${senderEmail}>`,
        to: recipientEmail,
        subject: `New Lead: ${leadData.name || "N/A"} - ${leadData.university || "N/A"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">New Admission Lead Received</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; width: 120px;"><strong>Name</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${leadData.name || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Mobile</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${leadData.mobile || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>University</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${leadData.university || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Action</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${leadData.action || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Timestamp</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${leadData.timestamp || "N/A"}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #888;">Lead ID: ${leadId}</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Successfully sent email notification for lead ${leadId}.`);
      emailSuccess = true;
    } catch (error) {
      console.error(`Error sending email for lead ${leadId}:`, error);
    }

    // ==========================================
    // TASK C: Update Firestore Status
    // ==========================================
    const updatePayload = {
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (sheetSuccess) updatePayload.sheetSynced = true;
    else updatePayload.syncError = true;

    if (emailSuccess) updatePayload.emailSent = true;
    else updatePayload.emailError = true;

    try {
      await snapshot.ref.update(updatePayload);
      console.log(`Successfully updated processing status for lead ${leadId}.`);
    } catch (error) {
      console.error(`Error updating status for lead ${leadId}:`, error);
    }
  }
);
