// SMS Service deactivated - using hardcoded authentication only

console.log('SMS OTP service deactivated - using hardcoded agent authentication');

export class SmsService {
  // Deactivated OTP functionality - no longer needed
  static async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    return { 
      success: false, 
      message: 'OTP service has been deactivated. Use hardcoded login credentials.' 
    };
  }

  static verifyOtp(phoneNumber: string, otp: string): { success: boolean; message: string } {
    return { 
      success: false, 
      message: 'OTP verification has been deactivated. Use hardcoded login credentials.' 
    };
  }
}