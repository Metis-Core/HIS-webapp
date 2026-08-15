import { PillVariantEnum } from '@/enum';
import { UserStatusEnum } from '@/enum/user.enum';

export const statusVariants: Record<UserStatusEnum, PillVariantEnum> = {
  [UserStatusEnum.ACTIVE]: PillVariantEnum.SUCCESS,
  [UserStatusEnum.INACTIVE]: PillVariantEnum.DEFAULT,
  [UserStatusEnum.PENDING_RESET]: PillVariantEnum.WARNING,
  [UserStatusEnum.SUSPENDED]: PillVariantEnum.DANGER,
};

export function roleLabel(value: string) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
