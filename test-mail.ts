import { sendOtpEmail } from './server/mailer.ts';

async function run() {
  console.log('Testing email send to dast92092@gmail.com...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  
  const result = await sendOtpEmail('dast92092@gmail.com', '123456');
  console.log('Result:', result);
}

run();
