import React from 'react';
import DotsLoader from '@/components/loader/dots-loader';
import { useOauth2 } from '@/hooks/auth/useOauth2';
import useTMB from '@/hooks/useTMB';

type AuthLoadingWrapperProps = {
    children: React.ReactNode;
};

const AuthLoadingWrapper = ({ children }: AuthLoadingWrapperProps) => {
    const { isSingleLoggingIn } = useOauth2();
    const { isTmbEnabled } = useTMB();

    const is_tmb_enabled = isTmbEnabled() || window.is_tmb_enabled === true;

    if (isSingleLoggingIn && !is_tmb_enabled) {
        return <DotsLoader isFullScreen size='lg' aria-label='Logging in' />;
    }

    return <>{children}</>;
};

export default AuthLoadingWrapper;
