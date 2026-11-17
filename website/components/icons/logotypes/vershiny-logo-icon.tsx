import type { CSSProperties } from 'react';

type VershinyLogoIconProps = {
  className?: string;
  style?: CSSProperties;
  /** Bump this value to replay the animation (forces SVG remount). */
  replayKey?: number | string;
};

const ICON_PATHS: { d: string; delay: string }[] = [
  {
    d: 'M64.1437 30.928C78.314 30.928 89.8014 42.4153 89.8014 56.5856H76.9725C76.9725 49.5005 71.2289 43.7568 64.1437 43.7568V30.928Z',
    delay: '0.5s',
  },
  {
    d: 'M54.5221 46.964C65.1498 46.964 73.7653 55.5795 73.7653 66.2073H64.1437C64.1437 60.8934 59.836 56.5856 54.5221 56.5856V46.964Z',
    delay: '0.4s',
  },
  {
    d: 'M44.9005 59.7928C53.7569 59.7928 60.9365 66.9724 60.9365 75.8289H52.9185C52.9185 71.4007 49.3287 67.8109 44.9005 67.8109V59.7928Z',
    delay: '0.3s',
  },
  {
    d: 'M36.8825 71.0181C43.9676 71.0181 49.7113 76.7617 49.7113 83.8469H43.2969C43.2969 80.3043 40.425 77.4325 36.8825 77.4325V71.0181Z',
    delay: '0.2s',
  },
  {
    d: 'M32.0716 82.2433C35.6142 82.2433 38.4861 85.1151 38.4861 88.6577C35.6883 88.6577 34.7602 88.6577 32.0716 88.6577V82.2433Z',
    delay: '0.1s',
  },
];

export function VershinyLogoIcon({
  className,
  style,
  replayKey = 0,
}: VershinyLogoIconProps) {
  return (
    <svg
      key={replayKey}
      viewBox="30 28 62 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden="true"
    >
      {ICON_PATHS.map((p, i) => (
        <path
          key={i}
          className="vershiny-anim-icon"
          style={{ animationDelay: p.delay }}
          d={p.d}
        />
      ))}
    </svg>
  );
}
