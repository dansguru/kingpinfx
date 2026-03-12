import DotsLoader from './dots-loader';

export default function ChunkLoader({ message }: { message: string }) {
    return (
        <div className='app-root chunk-loader' role='status' aria-live='polite'>
            <div className='chunk-loader__content'>
                <DotsLoader size='lg' aria-label='Loading' />
                <div className='load-message'>{message}</div>
            </div>
        </div>
    );
}
