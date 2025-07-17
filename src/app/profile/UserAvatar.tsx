import React from 'react';

export type UserAvatarProps = {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

export const DefaultUserSVG = ({
  className = '',
  width = 112,
  height = 112,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 112 112"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="56" cy="56" r="56" fill="#E5E7EB" />
    <circle cx="56" cy="46" r="21" fill="#9CA3AF" />
    <path
      d="M56 70c-18 0-32.4 9-32.4 18v3.6h64.8V88c0-9-14.4-18-32.4-18z"
      fill="#9CA3AF"
    />
  </svg>
);

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  className,
  width = 112,
  height = 112,
}) => {
  const [imgError, setImgError] = React.useState(false);

  if (!src || src.trim() === '' || imgError) {
    return (
      <span data-testid="avatar-fallback">
        <DefaultUserSVG className={className} width={width} height={height} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="eager"
      onError={() => setImgError(true)}
      style={{
        objectFit: 'cover',
        borderRadius: '9999px',
        border: '4px solid #BFDBFE',
        boxShadow: '0 2px 8px #0001',
      }}
    />
  );
};
