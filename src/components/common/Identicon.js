import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';

const Identicon = ({ string, size = 32, ...props }) => {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const generateAvatar = async () => {
      const avatar = createAvatar(identicon, {
        seed: string,
        size: size,
      });

      const dataUri = await avatar.toDataUri();
      setSvg(dataUri);
    };

    generateAvatar();
  }, [string, size]);

  if (!svg) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'block',
        }}
        {...props}
      />
    );
  }

  return (
    <Image
      src={svg}
      alt={`Identicon for ${string}`}
      width={size}
      height={size}
      style={{
        borderRadius: '50%',
        display: 'block',
      }}
      unoptimized={true}
      {...props}
    />
  );
};

export default Identicon;
