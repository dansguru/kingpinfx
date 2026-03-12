import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;
    return (
        <a className='app-header__logo kp-brand' href={standalone_routes.bot}>
            <span className='kp-brand__mark' aria-hidden='true'>
                K
            </span>
            <span className='kp-brand__text'>KingpinFX</span>
        </a>
    );
};
