async function callGeminiAPI(prompt) {
    const apiKey = CONFIG.GEMINI_KEY;
    
    // รายชื่อโมเดลที่เรียงจากตัวที่โควต้าน่าจะเยอะที่สุดไปหาน้อย
    const models = [
        "gemini-flash-lite-latest", // ตัวเลือกที่ 1 (แนะนำ)
        "gemini-flash-latest",      // ตัวเลือกที่ 2 (สำรอง)
        "gemini-2.0-flash-lite"     // ตัวเลือกที่ 3
    ];

    for (let model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await res.json();

            if (res.ok) {
                return data.candidates[0].content.parts[0].text;
            }

            // ถ้าเจอ Error 429 (Quota เต็ม) ให้ข้ามไปลอง model ตัวถัดไปใน List
            if (res.status === 429) {
                console.warn(`Model ${model} quota full, trying next...`);
                continue; 
            }

            throw new Error(data.error.message);

        } catch (err) {
            console.error(`Error with ${model}:`, err);
            if (model === models[models.length - 1]) throw err; // ถ้าเป็นตัวสุดท้ายแล้วยังพัง ให้พังเลย
        }
    }
}

async function generateAI() {
    const bizNameInput = document.getElementById("bizName");
    const bizOwnerInput = document.getElementById("bizOwner");
    const basicInfoInput = document.getElementById("basicInfo");
    const status = document.getElementById("statusMessage");

    const bizName = bizNameInput ? bizNameInput.value.trim() : "";
    const bizOwner = bizOwnerInput ? bizOwnerInput.value.trim() : "";
    const basicInfo = basicInfoInput ? basicInfoInput.value.trim() : "";

    if (!basicInfo) {
        status.textContent = "กรุณากรอกรายละเอียดธุรกิจก่อนให้ AI ช่วยวิเคราะห์";
        return;
    }

    status.textContent = "กำลังสร้างโมเดลธุรกิจด้วย AI กรุณารอสักครู่...";

    const prompt = `คุณคือผู้เชี่ยวชาญด้าน Business Model Canvas ช่วยออกแบบ BMC ภาษาไทยจากข้อมูลนี้:
    ชื่อธุรกิจ: ${bizName || "-"}
    รายละเอียด: ${basicInfo || "-"}
    
    คำสั่งสำคัญ: 
    1. ตอบเป็นภาษาไทยในรูปแบบ JSON Object เท่านั้น
    2. ห้ามเขียนคำนำหรือคำอธิบายปนมาเด็ดขาด
    3. ต้องใช้ Key ดังนี้: partners, activities, resources, value, relationships, channels, segments, cost, revenue`;

    try {
        const text = await callGeminiAPI(prompt);
        if (!text) throw new Error("ไม่ได้รับข้อมูลจาก AI");

        const jsonMatch = text.match(/\{[\s\S]*\}/); 
        if (!jsonMatch) throw new Error("AI ตอบกลับในรูปแบบที่ระบบไม่อ่านไม่ได้");
        
        const bmc = JSON.parse(jsonMatch[0]);

        const setVal = (id, key) => {
            const el = document.getElementById(id);
            if (el) el.value = bmc[key] || "ไม่มีข้อมูล";
        };

        setVal("bmc-key-partners", "partners");
        setVal("bmc-key-activities", "activities");
        setVal("bmc-key-resources", "resources");
        setVal("bmc-value-propositions", "value");
        setVal("bmc-customer-relationships", "relationships");
        setVal("bmc-channels", "channels");
        setVal("bmc-customer-segments", "segments");
        setVal("bmc-cost-structure", "cost");
        setVal("bmc-revenue-streams", "revenue");

        if (document.getElementById("display-bizName")) document.getElementById("display-bizName").value = bizName;
        if (document.getElementById("display-bizOwner")) document.getElementById("display-bizOwner").value = bizOwner;
        if (document.getElementById("bizDate")) document.getElementById("bizDate").valueAsDate = new Date();

        status.textContent = "สร้างโมเดลธุรกิจสำเร็จ!";
        document.querySelector(".bmc-canvas")?.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error(err);
        status.textContent = "เกิดข้อผิดพลาด: " + err.message;
    }
}

async function exportImage() {
    const element = document.querySelector(".bmc-canvas");
    const bizName = document.getElementById("display-bizName")?.value || "Business-Model";
    const status = document.getElementById("statusMessage");

    if (!element) return;
    if (status) status.textContent = "กำลังสร้างไฟล์รูปภาพ...";

    // 1. จัดการช่อง Input/Textarea ให้เป็นข้อความธรรมดาชั่วคราวเพื่อให้ภาพชัดเจน
    const allInputs = element.querySelectorAll('input, textarea');
    const tempDivs = [];

    allInputs.forEach(input => {
        const replacement = document.createElement('div');
        replacement.innerText = input.value;
        replacement.style.cssText = `
            font-size: 14px; 
            white-space: pre-wrap; 
            width: 100%; 
            color: #000;
            padding: 2px;
        `;
        replacement.className = "temp-image-text";
        input.style.display = 'none';
        input.parentNode.insertBefore(replacement, input);
        tempDivs.push({ input, replacement });
    });

    try {
        // 2. แปลง Element เป็น Canvas
        const canvas = await html2canvas(element, {
            scale: 2, // เพิ่มความชัดเป็น 2 เท่า
            useCORS: true,
            backgroundColor: "#f3f6f6" // สีพื้นหลังตาม CSS ของคุณ
        });

        // 3. ดาวน์โหลดเป็นไฟล์ PNG
        const link = document.createElement('a');
        link.download = `BMC-${bizName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        if (status) status.textContent = "บันทึกรูปภาพสำเร็จ!";
    } catch (err) {
        console.error(err);
        if (status) status.textContent = "เกิดข้อผิดพลาดในการสร้างรูปภาพ";
    } finally {
        // 4. คืนค่าช่องกรอกกลับมาเหมือนเดิม
        tempDivs.forEach(item => {
            item.replacement.remove();
            item.input.style.display = '';
        });
    }
}

async function generateSuggestions() {
    const basicInfo = document.getElementById("basicInfo").value.trim();
    const suggestionResult = document.getElementById("suggestionResult");
    const status = document.getElementById("statusMessage");

    if (!basicInfo) {
        alert("กรุณากรอกรายละเอียดธุรกิจในช่องด้านบนก่อน เพื่อให้ AI วิเคราะห์คำแนะนำครับ");
        return;
    }

    status.textContent = "กำลังวิเคราะห์ข้อเสนอแนะอัจฉริยะ...";
    suggestionResult.value = "AI กำลังประมวลผลคำแนะนำที่เหมาะสมที่สุดสำหรับคุณ...";

    const prompt = `คุณคือที่ปรึกษาธุรกิจมืออาชีพ โปรดวิเคราะห์ธุรกิจนี้: "${basicInfo}" 
    แล้วให้คำแนะนำ 4 หัวข้อ ดังนี้:
    1. กลยุทธ์การตลาดในชุมชนและโรงงาน
    2. แนวทางการลดต้นทุน
    3. การเพิ่มมูลค่าด้วยทักษะฝีมือแรงงาน
    4. โอกาสในการขยายตัวในอนาคต
    (ตอบเป็นภาษาไทยแบบข้อๆ ที่นำไปใช้ได้จริง)`;

    try {
        const text = await callGeminiAPI(prompt);
        if (text) {
            suggestionResult.value = text;
            status.textContent = "วิเคราะห์คำแนะนำสำเร็จ!";
            // สกอร์หน้าจอลงมาที่ช่องคำแนะนำ
            suggestionResult.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (err) {
        console.error(err);
        suggestionResult.value = "ไม่สามารถสร้างคำแนะนำได้ในขณะนี้: " + err.message;
        status.textContent = "เกิดข้อผิดพลาดในการดึงข้อมูลคำแนะนำ";
    }
}