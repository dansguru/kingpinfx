import clsx from 'clsx';
import './dots-loader.scss';

type DotsLoaderProps = {
    className?: string;
    'aria-label'?: string;
    isFullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
};

const DotsLoader = ({ className, 'aria-label': ariaLabel, isFullScreen, size = 'md' }: DotsLoaderProps) => {
    return (
        <div
            className={clsx('kp-dots-loader', className, {
                'kp-dots-loader--fullscreen': isFullScreen,
                [`kp-dots-loader--${size}`]: size,
            })}
            role='status'
            aria-live='polite'
            aria-label={ariaLabel ?? 'Loading'}
        >
            <span className='kp-dots-loader__dot' />
            <span className='kp-dots-loader__dot' />
            <span className='kp-dots-loader__dot' />
        </div>
    );
};

export default DotsLoader;
