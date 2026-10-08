import React, {useState} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';

/** An SVG <image> that holds the render until the bitmap has loaded. */
export const SvgImage: React.FC<React.SVGProps<SVGImageElement> & {href: string}> = ({href, ...rest}) => {
  const [handle] = useState(() => delayRender(`Loading ${href}`));
  return (
    <image
      href={href}
      onLoad={() => continueRender(handle)}
      onError={() => cancelRender(new Error(`Could not load ${href}`))}
      {...rest}
    />
  );
};
