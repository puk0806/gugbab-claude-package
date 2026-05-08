import { Slider as Headless, type SliderRootProps, type SliderThumbProps } from '@gugbab/headless';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type SliderSize = 'sm' | 'md';

export interface SliderStyledRootProps extends SliderRootProps {
  size?: SliderSize;
}

const Root = forwardRef<HTMLDivElement, SliderStyledRootProps>(function SliderRoot(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <Headless.Root
      ref={ref}
      className={cn('grx-slider', `grx-slider--${size}`, className)}
      {...rest}
    />
  );
});

const Track = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function SliderTrack(
  { className, ...rest },
  ref,
) {
  return <Headless.Track ref={ref} className={cn('grx-slider__track', className)} {...rest} />;
});

const Range = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function SliderRange(
  { className, ...rest },
  ref,
) {
  return <Headless.Range ref={ref} className={cn('grx-slider__range', className)} {...rest} />;
});

const Thumb = forwardRef<HTMLSpanElement, SliderThumbProps>(function SliderThumb(
  { className, ...rest },
  ref,
) {
  return <Headless.Thumb ref={ref} className={cn('grx-slider__thumb', className)} {...rest} />;
});

export const Slider = { Root, Track, Range, Thumb };
