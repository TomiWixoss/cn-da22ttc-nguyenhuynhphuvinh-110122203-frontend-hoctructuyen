"use client";

import { useAvatarContext } from "@/lib/contexts/avatar-context";

// Hook `useAvatar` bây giờ chỉ đơn giản là một proxy cho context
export const useAvatar = () => {
  return useAvatarContext();
};

export default useAvatar;
