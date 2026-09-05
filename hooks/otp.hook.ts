'use client';

import { useCallback, useState } from 'react';
import otpService from '@/helpers/otp.service';
import type { IGenerateOtpDto, IVerifyOtpDto } from '@/interfaces';

export function useOtp() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const generate = useCallback(async (dto: IGenerateOtpDto) => {
    setIsGenerating(true);
    try {
      return await otpService.generate(dto);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const verify = useCallback(async (dto: IVerifyOtpDto) => {
    setIsVerifying(true);
    try {
      return await otpService.verify(dto);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { generate, verify, isGenerating, isVerifying };
}
