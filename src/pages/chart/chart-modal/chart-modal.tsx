import { Suspense } from 'react';
import { observer } from 'mobx-react-lite';
import DotsLoader from '@/components/loader/dots-loader';
import { useDevice } from '@deriv-com/ui';
import ChartModalDesktop from './chart-modal-desktop';

export const ChartModal = observer(() => {
    const { isDesktop } = useDevice();
    return (
        <Suspense fallback={<DotsLoader aria-label='Loading chart' />}>{isDesktop && <ChartModalDesktop />}</Suspense>
    );
});

export default ChartModal;
