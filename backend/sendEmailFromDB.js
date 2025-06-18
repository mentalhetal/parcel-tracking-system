const nodemailer = require('nodemailer');

let admin;

function initFirebase(firebaseAdminInstance) {
  admin = firebaseAdminInstance;
}

async function sendEmailFromDB(deliveryId, subject, text) {
  if (!admin) {
    console.error('❌ Firebase Admin SDK not initialized');
    return;
  }

  try {
    // 1️⃣ 발신 계정 정보 가져오기
    const mailerSnapshot = await admin.database().ref('mailer_account').once('value');
    const mailer = mailerSnapshot.val();

    if (!mailer || !mailer.email || !mailer.password) {
      console.error('❌ 메일 발신 계정 정보 누락 (mailer_account)');
      return;
    }

    // 2️⃣ 배송 정보에서 수신자 이메일 가져오기
    const deliverySnapshot = await admin.database().ref(`deliveries/${deliveryId}`).once('value');
    const delivery = deliverySnapshot.val();

    if (!delivery || !delivery.user_email) {
      console.warn(`❌ 수신자 이메일 없음: deliveryId = ${deliveryId}`);
      return;
    }

    const to = delivery.user_email;

    // 3️⃣ Nodemailer 전송
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailer.email,
        pass: mailer.password
      }
    });

    const info = await transporter.sendMail({
      from: `"배송 알림" <${mailer.email}>`,
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
