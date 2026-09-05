export interface IGenerateOtpDto {
  userId: string;
}

export interface IGenerateOtpResponse {
  verificationToken: string;
  expiresIn: number;
}

export interface IVerifyOtpDto {
  verificationToken: string;
  code: string;
}

export interface IVerifyOtpResponse {
  verified: boolean;
}
