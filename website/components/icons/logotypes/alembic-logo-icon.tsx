import { Icon, IconProps } from "../icon";

export function AlembicLogoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <defs>
        <linearGradient id="alembic-logo-gradient" x1="3" y1="21" x2="21" y2="3">
          <stop stopColor="#2F9E8F" />
          <stop offset="1" stopColor="#4C6FFF" />
        </linearGradient>
      </defs>
      <path d="M12 3.2 21 20.8H3L12 3.2Z" fill="url(#alembic-logo-gradient)" />
      <path
        d="M9.4 20.8 12 14l2.6 6.8"
        stroke="var(--bg)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Icon>
  );
}

export default AlembicLogoIcon;
