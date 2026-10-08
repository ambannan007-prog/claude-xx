// ─── Editable video settings ────────────────────────────────────────────
// Change any on-screen text here, then re-run `node render.mjs`.
window.CONFIG = {
  fps: 60,
  duration: 27, // seconds

  // Demo lead (sheet row number). Row 74 = "Vivesh", Ernakulam.
  demoRow: 74,
  demoPhoneMasked: "+91 94478 •• •••",
  demoLinkMasked: "https://wa.me/9194478•••••",

  // "prefill": WhatsApp opens with a message that already contains the lead name.
  //            Needs the sheet link to carry ?text=… (see README).
  // "chat":    matches the sheet's current link (wa.me/<number>, labelled with the
  //            lead name) — opens that lead's chat; compose box is empty.
  whatsappMode: "prefill",
  // {name} is replaced with the demo lead's name.
  messageTemplate: "Hi {name}, thank you for your enquiry about a school trip. When would be a good time to talk about your plans?",

  text: {
    introTop: "LEAD SYSTEM",
    introBottom: "UPDATED",

    u1Num: "01 /",
    u1Title: "Preferred Location",
    u1Sub: "Captured automatically from the lead form",
    u1Sub2: "Know the customer's preferred location before follow-up.",
    u1Chips: ["Ernakulam", "Calicut"],

    u2Num: "02 /",
    u2Title: "Personalized WhatsApp",
    u2Sub: "Lead → WhatsApp in one click",
    u2Sub2Prefill: "Name already personalized.",
    u2Sub2Chat: "Opens the lead's chat — labelled by name.",

    outro: ["Preferred Location", "Personalized WhatsApp", "Faster Follow-up"],
  },
};
