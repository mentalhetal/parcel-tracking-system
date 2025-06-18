const nodemailer = require('nodemailer');

let admin;

function initFirebase(firebaseAdminInstance) {
  admin = firebaseAdminInstance;
}

async function sendEmailFromDB(deliveryId, subject, text) {
  if (!admin) {
    console.error('Firebase Admin SDK not initialized');
    return;
  }

  try {
    const snapshot = await admin.database().ref(`deliveries/${deliveryId}`).once('value');
    const data = snapshot.val();

    if (!data || !data.user_email) {
      console.warn(`❌ 이메일 정보 없음: deliveryId = ${deliveryId}`);
      return;
    }

    const to = data.user_email;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your.email@gmail.com',      // 발신자 이메일
        pass: 'your-app-password'          // 앱 비밀번호
      }
    });

    const info = await transporter.sendMail({
      from: '"배송 알림" <your.email@gmail.com>',
      to,
      subject,
      text
    });

    console.log(`📧 이메일 전송 완료 → ${to} (${info.messageId})`);
  } catch (error) {
    console.error('🚨 이메일 전송 실패:', error);
  }
}

module.exports = { sendEmailFromDB, initFirebase };
