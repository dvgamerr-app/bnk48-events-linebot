# BNK48 Event Notify
Notify BNK48 Event Schedule with you LINE API by touno.io.


### How to Setting
1. เข้าเว็บ `https://developers.line.biz/en/` แล้วเข้าระบบด้วย LINE 
// https://account.line.biz/login?scope=line&redirectUri=https%3A%2F%2Fdevelopers.line.biz%2Flogin%3Fbox%3D%2Fconsole%

2. กด Create new provider ตั้งชื่อ เป็นอะไรก็ได้
3. Create Channel แบบ Messaging API
4. กรอกรายละเอียดให้ครบ (Category เลือกเป็น เว็บไซต์ และ Subcategory ก็เลือกเป็น เว็บไซต์) แล้วกด Confirm แล้วก็ กด ยอมรับ
5. เลื่อนลงมาด้านล่างแล้ว checkbox ที่ Terms of Use ทั้งสองอัน แล้วกด Create
6. เมื่อสร้างเสร็จให้กด Channel ที่้เราสร้างเข้าไปแก้ไข
7. แถบ Channel settings ตรงหัวข้อ Channel secret `(32 chars)` copy เก็บไว้
8. ด้านล้างสุดตรงหัวข้อ User ID `(33 chars)` copy เก็บไว้

9. เปิดเว็บไซต์ ด้วย URL: `https://bnk48.touno.io/{user_id}/{chanel_secret}` นี้ ใส่ userid และ chanel secret ให้ถูกต้อง
ตัวอย่าง `https://bnk48.touno.io/U3aecfffff0dcaefffff1bd6a3e1c0e0a/fc3beffffdda9c9ffff8d1868fffff8c`
10. ให้เลื่อนหา Channel access token (long-lived) กดตรง Issue 
**หมายเหตุ เลือก Time until token becomes invalid เป็น 0 hours นะครับ ไม่งั้นพอครับ จำนวนชั่วโมงที่กำหนดแล้ว token อันนี้จะตาย**

11. กรอก Channel access token ใส่ที่หน้าเว็บ แล้วกด Checking
12. กลับมาหน้า LINE API กดเลือก edit ที่ Use webhooks  ให้ตั้ง เป็น enabled.
13. ที่ Webhook URL ให้ใส่ URL เดียวกัน `https://bnk48.touno.io/{user_id}/{chanel_secret}` กด Update 
14. กด Verify URL เพื่อให้ระบบ ตรวจสอบความถูกต้อง.
15. Scan QR code เพื่อ เพิ่ม bot เข้าไปใน account ของเรา.

### How to use
1. พิมพ์ oshi แล้วตามด้วย nickname ของน้องที่ต้องการติดตาม events `oshi cherprang pun music`.
2. พิมพ์ hen แล้วตามด้วย nickname ของน้องที่ต้องการยกเลิกติดตาม events `hen pun`.
3. ถ้าต้องการติดตามทุกคนให้พิม `oshi dd` หรือ `hen dd`
