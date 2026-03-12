import { Loader } from '@deriv-com/ui';

export default function ChunkLoader({ message }: { message: string }) {
    return (
        <div className='app-root chunk-loader' role='status' aria-live='polite'>
            <div className='chunk-loader__content'>
                <Loader />
                <div className='load-message'>{message}</div>
            </div>
        </div>
    );
}
