# การตั้งค่าระบบเชื่อมต่อ Google Sheets และ Google Drive (ไร้ระบบล็อกอิน)

เมื่อเรามีโครงหน้าตาเว็บไซต์ `index.html` เรียบร้อย ต่อไปคือการเอาข้อมูลจริงของลูกค้ามาจาก Google 

## ขั้นตอนที่ 1: เตรียม Google Sheets

1. ให้ลูกค้าสร้าง Google Sheets ใหม่ 1 ไฟล์
2. สร้าง Sheet แรกตั้งชื่อว่า **Profile** และสร้างคอลัมน์เหล่านี้ในบรรทัดแรก (Row 1):
   - A1: `logoName` (เช่น ARCH.Studio)
   - B1: `title` (เช่น T. Chayapol)
   - C1: `subtitle` (เช่น Architect & Interior Designer)
   - D1: `description` (ประวัติส่วนตัวยาวๆ)
3. สร้าง Sheet ที่สองตั้งชื่อว่า **Contact**
   - A1: `email`
   - B1: `phone`
   - C1: `address`
   - D1: `instagram`
4. สร้าง Sheet ที่สามตั้งชื่อว่า **Works**
   - A1: `CategoryName` (เช่น งานสถาปัตย์, งานภายใน, อื่นๆ)
   - B1: `ImageURL` (ลิงก์รูปจาก Google Drive ที่ปรับเป็น Public แล้ว)

## ขั้นตอนที่ 2: เตรียม Google Apps Script

เพื่อแปลง Google Sheets ให้กลายเป็น API ที่เว็บไซต์เข้าไปอ่านได้ (โดยที่คนอื่นแก้ข้อมูลไม่ได้)

1. ในหน้า Google Sheets ให้ไปที่เมนู **ส่วนขยาย (Extensions) > Apps Script**
2. ลบโค้ดเก่าทิ้งทั้งหมด แล้วนำโค้ดด้านล่างนี้ไปวาง:

```javascript
function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Get Profile
  var profileSheet = ss.getSheetByName('Profile');
  var profileData = profileSheet.getDataRange().getValues();
  
  // 2. Get Contact
  var contactSheet = ss.getSheetByName('Contact');
  var contactData = contactSheet.getDataRange().getValues();

  // 3. Get Works
  var worksSheet = ss.getSheetByName('Works');
  var worksData = worksSheet.getDataRange().getValues();
  
  var categoriesObj = {};
  
  // แปลงข้อมูลผลงานให้กลายเป็นหมวดหมู่
  for(var i=1; i<worksData.length; i++) {
    var cat = worksData[i][0];
    var url = worksData[i][1];
    if(!categoriesObj[cat]) {
      categoriesObj[cat] = [];
    }
    categoriesObj[cat].push(url);
  }
  
  var categoriesArray = [];
  for(var key in categoriesObj) {
    categoriesArray.push({
      name: key,
      images: categoriesObj[key]
    });
  }
  
  var result = {
    profile: {
      logoName: profileData[1][0],
      title: profileData[1][1],
      subtitle: profileData[1][2],
      description: profileData[1][3]
    },
    contact: {
      email: contactData[1][0],
      phone: contactData[1][1],
      address: contactData[1][2],
      instagram: contactData[1][3]
    },
    categories: categoriesArray
  };
  
  // ส่งออกเป็น JSON
  return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
}
```

## ขั้นตอนที่ 3: เปิดใช้งานตัวดึงข้อมูลอัตโนมัติ

1. ในหน้าจอ Apps Script กดปุ่ม **การนำไปใช้งาน (Deploy) > การนำไปใช้งานรายการใหม่ (New deployment)**
2. เลือกประเภทเป็น **เว็บแอป (Web App)**
3. ข้อมูลคำอธิบาย: "Portfolio API V1"
4. สิทธิ์การเข้าถึง (Who has access): เลือกเป็น **ทุกคน (Anyone)** _สำคัญมากเพื่อให้หน้าเว็บฝั่ง User ดึงข้อความได้_
5. กด Deploy ระบบอาจให้ยืนยันอีเมล ก็ทำตามขั้นตอน
6. **คัดลอก "URL ของเว็บแอป"** ที่ขึ้นมา (จะยาวๆ ขึ้นต้นด้วย https://script.google.com/macros/s/...)

## ขั้นตอนที่ 4: เชื่อม API เข้ากับเว็บไซต์

นำ URL ยาวๆ จากขั้นตอนที่ 3 ไปใส่แทนค่า MOCK_API_DATA ใน **`script.js`** ของเรา โดยใช้คำสั่ง `fetch('URL_ของลูกค้า_ตรงนี้')` 

*หมายเหตุ: เมื่อถึงขั้นตอนนี้ สามารถแจ้งผม (ผู้ช่วย AI) ให้เติมระบบ `fetch` ลงไปในโค้ด `script.js` เพื่อให้สมบูรณ์ได้เลยครับ!*
