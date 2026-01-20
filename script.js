async function callGeminiAPI(prompt) {
  const apiKey = "AIzaSyC2iHpd40LjJMVB6BYday7d_C5bpFbwX08"; // แก้ตรงนี้
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    // ถ้าไม่มี API Key ให้คืนข้อความจำลอง
    return "ยังไม่ได้ตั้งค่า API Key จะใช้ข้อความจำลองแทน\n\n- ตัวอย่างคำแนะนำสำหรับผู้ประกอบการในชุมชน...";
  }

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateAI() {
  const bizName = document.getElementById("bizName").value.trim();
  const bizOwner = document.getElementById("bizOwner").value.trim();
  const basicInfo = document.getElementById("basicInfo").value.trim();
  const status = document.getElementById("statusMessage");

  status.textContent = "กำลังสร้างโมเดลธุรกิจด้วย AI กรุณารอสักครู่...";

  const prompt = `
คุณคือผู้เชี่ยวชาญด้าน Business Model Canvas ช่วยออกแบบ BMC จากข้อมูลต่อไปนี้:

ชื่อธุรกิจ: ${bizName || "-"}
ผู้รับผิดชอบ/ช่างเอนกประสงค์: ${bizOwner || "-"}
รายละเอียดเบื้องต้น:
${basicInfo || "-"}

ให้ตอบเป็น JSON ภาษาไทย ในรูปแบบ:
{
  "Key Partners": "",
  "Key Activities": "",
  "Key Resources": "",
  "Value Propositions": "",
  "Customer Relationships": "",
  "Channels": "",
  "Customer Segments": "",
  "Cost Structure": "",
  "Revenue Streams": ""
}
`;

  try {
    const text = await callGeminiAPI(prompt);

    let bmc;
    try {
      bmc = JSON.parse(text);
    } catch (e) {
      // ถ้า parse ไม่ได้ ให้ใช้ข้อความจำลอง
      bmc = {
        "Key Partners": "ตัวอย่างพันธมิตรหลัก...",
        "Key Activities": "ตัวอย่างกิจกรรมหลัก...",
        "Key Resources": "ตัวอย่างทรัพยากรหลัก...",
        "Value Propositions": "ตัวอย่างคุณค่าเสนอ...",
        "Customer Relationships": "ตัวอย่างความสัมพันธ์ลูกค้า...",
        "Channels": "ตัวอย่างช่องทาง...",
        "Customer Segments": "ตัวอย่างกลุ่มลูกค้า...",
        "Cost Structure": "ตัวอย่างโครงสร้างต้นทุน...",
        "Revenue Streams": "ตัวอย่างกระแสรายได้..."
      };
    }

    // ใส่ลงในช่อง BMC
    document.getElementById("bmc-key-partners").value = bmc["Key Partners"] || "";
    document.getElementById("bmc-key-activities").value = bmc["Key Activities"] || "";
    document.getElementById("bmc-key-resources").value = bmc["Key Resources"] || "";
    document.getElementById("bmc-value-propositions").value = bmc["Value Propositions"] || "";
    document.getElementById("bmc-customer-relationships").value = bmc["Customer Relationships"] || "";
    document.getElementById("bmc-channels").value = bmc["Channels"] || "";
    document.getElementById("bmc-customer-segments").value = bmc["Customer Segments"] || "";
    document.getElementById("bmc-cost-structure").value = bmc["Cost Structure"] || "";
    document.getElementById("bmc-revenue-streams").value = bmc["Revenue Streams"] || "";

    status.textContent = "สร้างโมเดลธุรกิจสำเร็จ สามารถแก้ไขรายละเอียดในแต่ละช่องได้ก่อน Export PDF";
  } catch (err) {
    console.error(err);
    status.textContent = "เกิดข้อผิดพลาดในการเรียกใช้ AI กรุณาลองใหม่อีกครั้ง";
  }
}

async function generateSuggestions() {
  const bizName = document.getElementById("bizName").value.trim();
  const basicInfo = document.getElementById("basicInfo").value.trim();
  const suggestionBox = document.getElementById("suggestionResult");
  const status = document.getElementById("statusMessage");

  status.textContent = "กำลังสร้าง Smart Suggestion สำหรับผู้ประกอบการในชุมชน...";

  const prompt = `
คุณคือที่ปรึกษาธุรกิจชุมชน ช่วยให้คำแนะนำเชิงกลยุทธ์แบบเข้าใจง่าย
สำหรับธุรกิจต่อไปนี้:

ชื่อธุรกิจ: ${bizName || "-"}
รายละเอียดเบื้องต้น:
${basicInfo || "-"}

ให้ตอบเป็นภาษาไทย แบ่งหัวข้อ:
1) โอกาสในชุมชน
2) การพัฒนาสินค้า/บริการ
3) ช่องทางการตลาดที่เหมาะสม
4) การสร้างเครือข่าย/พันธมิตร
5) ข้อเสนอแนะเพิ่มเติมสำหรับผู้ประกอบการมือใหม่
`;

  try {
    const text = await callGeminiAPI(prompt);
    suggestionBox.value = text || "ยังไม่มีคำแนะนำจากระบบ";
    status.textContent = "สร้าง Smart Suggestion สำเร็จ สามารถปรับแก้ข้อความได้ตามต้องการ";
  } catch (err) {
    console.error(err);
    suggestionBox.value = "เกิดข้อผิดพลาดในการสร้างคำแนะนำ กรุณาลองใหม่อีกครั้ง";
    status.textContent = "เกิดข้อผิดพลาดในการสร้าง Smart Suggestion";
  }
}

async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  const bizName = document.getElementById("bizName").value.trim();
  const bizOwner = document.getElementById("bizOwner").value.trim();

  let y = 12;

  pdf.setFontSize(14);
  pdf.text("Business Model Canvas", 10, y);
  y += 8;

  pdf.setFontSize(11);
  pdf.text(`ชื่อธุรกิจ: ${bizName || "-"}`, 10, y);
  y += 6;
  pdf.text(`ช่างเอนกประสงค์/ผู้รับผิดชอบ: ${bizOwner || "-"}`, 10, y);
  y += 8;

  const fields = [
    ["Key Partners", "bmc-key-partners"],
    ["Key Activities", "bmc-key-activities"],
    ["Key Resources", "bmc-key-resources"],
    ["Value Propositions", "bmc-value-propositions"],
    ["Customer Relationships", "bmc-customer-relationships"],
    ["Channels", "bmc-channels"],
    ["Customer Segments", "bmc-customer-segments"],
    ["Cost Structure", "bmc-cost-structure"],
    ["Revenue Streams", "bmc-revenue-streams"]
  ];

  pdf.setFontSize(10);

  fields.forEach(([label, id]) => {
    const value = document.getElementById(id).value || "";
    const lines = pdf.splitTextToSize(`${label}: ${value}`, 190);
    if (y + lines.length * 5 > 280) {
      pdf.addPage();
      y = 12;
    }
    pdf.text(lines, 10, y);
    y += lines.length * 5 + 3;
  });

  pdf.save("business-model-canvas.pdf");
}