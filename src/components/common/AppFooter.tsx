'use client';

import React from 'react';

const AppFooter: React.FC = () => (
  <footer className="w-full bg-[#ea2227] border-t border-gray-200 py-3 px-4 text-xs text-white flex flex-col sm:flex-row justify-between items-center gap-2 flex-shrink-0">
    <div className="text-left">
      <span className="font-semibold text-white">
        CÔNG TY CỔ PHẦN CƠ KHÍ XÂY DỰNG THƯƠNG MẠI ĐẠI DŨNG
      </span>
      <span className="hidden sm:inline"> | </span>
      <span>
        123 Bạch Đằng, Phường Tân Sơn Hòa, Quận Tân Bình, Thành phố Hồ Chí Minh
        <span className="hidden sm:inline"> | </span>
        <span className="block sm:inline">+84 28 38681689</span>
        <span className="hidden sm:inline"> | </span>
        <a
          href="https://www.daidung.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-white hover:text-gray-200"
        >
          www.daidung.com
        </a>
      </span>
    </div>
    <div className="text-right font-medium">
      <span className="text-white">
        Powered by Ban KSNB - Tập đoàn Đại Dũng 2025
      </span>
    </div>
  </footer>
);

export default AppFooter;
