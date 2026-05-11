import { useIsomorphicLayoutEffect } from '@gugbab/hooks';
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface AvatarContextValue {
  imageLoadingStatus: ImageLoadingStatus;
  onImageLoadingStatusChange: (status: ImageLoadingStatus) => void;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

function useAvatarContext(consumerName: string): AvatarContextValue {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error(`${consumerName} must be rendered inside <Avatar.Root>`);
  return ctx;
}

const AvatarRoot = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function AvatarRoot(props, ref) {
    const [imageLoadingStatus, setImageLoadingStatus] = useState<ImageLoadingStatus>('idle');
    return (
      <AvatarContext.Provider
        value={{
          imageLoadingStatus,
          onImageLoadingStatusChange: setImageLoadingStatus,
        }}
      >
        <span ref={ref} data-state={imageLoadingStatus} {...props} />
      </AvatarContext.Provider>
    );
  },
);

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Called whenever the image's loading status changes. */
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(function AvatarImage(
  { src, referrerPolicy, crossOrigin, onLoadingStatusChange, ...rest },
  ref,
) {
  const ctx = useAvatarContext('Avatar.Image');
  const status = useImageLoadingStatus(src, { referrerPolicy, crossOrigin });
  const onChangeRef = useRef(onLoadingStatusChange);
  onChangeRef.current = onLoadingStatusChange;

  useIsomorphicLayoutEffect(() => {
    if (status !== 'idle') {
      onChangeRef.current?.(status);
      ctx.onImageLoadingStatusChange(status);
    }
  }, [status, ctx]);

  if (status !== 'loaded') return null;
  return (
    <img ref={ref} src={src} referrerPolicy={referrerPolicy} crossOrigin={crossOrigin} {...rest} />
  );
});

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  /** Delay in ms before the fallback becomes visible. Useful to avoid flashing. */
  delayMs?: number;
}

const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(function AvatarFallback(
  { delayMs, ...rest },
  ref,
) {
  const ctx = useAvatarContext('Avatar.Fallback');
  const [canRender, setCanRender] = useState(delayMs === undefined);

  useEffect(() => {
    if (delayMs === undefined) return;
    const timer = window.setTimeout(() => setCanRender(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!canRender) return null;
  if (ctx.imageLoadingStatus === 'loaded') return null;
  return <span ref={ref} {...rest} />;
});

function resolveLoadingStatus(image: HTMLImageElement | null, src?: string): ImageLoadingStatus {
  if (!image) return 'idle';
  if (!src) return 'error';
  if (image.src !== src) image.src = src;
  return image.complete && image.naturalWidth > 0 ? 'loaded' : 'loading';
}

function useImageLoadingStatus(
  src: string | undefined,
  {
    referrerPolicy,
    crossOrigin,
  }: {
    referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
    crossOrigin?: ImgHTMLAttributes<HTMLImageElement>['crossOrigin'];
  },
) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isClient = typeof window !== 'undefined';
  const image = (() => {
    if (!isClient) return null;
    if (!imageRef.current) imageRef.current = new window.Image();
    return imageRef.current;
  })();

  const [loadingStatus, setLoadingStatus] = useState<ImageLoadingStatus>(() =>
    resolveLoadingStatus(image, src),
  );

  useIsomorphicLayoutEffect(() => {
    setLoadingStatus(resolveLoadingStatus(image, src));
  }, [image, src]);

  useIsomorphicLayoutEffect(() => {
    if (!image) return;
    const handleLoad = () => setLoadingStatus('loaded');
    const handleError = () => setLoadingStatus('error');
    image.addEventListener('load', handleLoad);
    image.addEventListener('error', handleError);
    if (referrerPolicy) image.referrerPolicy = referrerPolicy;
    if (typeof crossOrigin === 'string') image.crossOrigin = crossOrigin;
    return () => {
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', handleError);
    };
  }, [image, referrerPolicy, crossOrigin]);

  return loadingStatus;
}

export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
};
