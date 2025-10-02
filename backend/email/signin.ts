export function sendOtpTemplate({ otp }: { otp: string }) { 
  return `Welcome to AurAI!

Here's your OTP: ${otp}

Please enter it in the login page to verify your account.

Best,
AurAI Team`;
}

export default sendOtpTemplate;
