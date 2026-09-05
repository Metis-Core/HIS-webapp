import { publicApi } from './axios';
import { OtpEndpointEnum } from '@/enum';
import type { IGenerateOtpDto, IGenerateOtpResponse, IVerifyOtpDto, IVerifyOtpResponse } from '@/interfaces';

class OtpService {
  async generate(dto: IGenerateOtpDto): Promise<IGenerateOtpResponse> {
    const { data } = await publicApi.post<IGenerateOtpResponse>(OtpEndpointEnum.GENERATE, dto);
    return data;
  }

  async verify(dto: IVerifyOtpDto): Promise<IVerifyOtpResponse> {
    const { data } = await publicApi.post<IVerifyOtpResponse>(OtpEndpointEnum.VERIFY, dto);
    return data;
  }
}

const otpService = new OtpService();
export default otpService;
