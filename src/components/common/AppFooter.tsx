'use client';

import React from 'react';

const AppFooter: React.FC = () => (
  <footer className="w-full bg-[#ea2227] border-t border-gray-200 py-3 text-xs text-white flex flex-col items-center gap-2 flex-shrink-0">
    <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-center text-center sm:text-left px-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-center w-full sm:w-7/10">
        <span className="font-semibold text-white block">
          CÔNG TY CỔ PHẦN CƠ KHÍ XÂY DỰNG THƯƠNG MẠI ĐẠI DŨNG
        </span>
        <span className="hidden sm:inline mx-2">|</span>
        <span className="block sm:inline mt-1 sm:mt-0">
          123 Bạch Đằng, P.Tân Sơn Hòa, Q.Tân Bình, TP.HCM
          <span className="hidden sm:inline mx-2">|</span>
          <span className="block sm:inline">+84 28 38681689</span>
          <span className="hidden sm:inline mx-2">|</span>
          <a
            href="https://www.daidung.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white hover:text-gray-200 ml-1"
          >
            www.daidung.com
          </a>
        </span>
      </div>
      <div className="w-full sm:w-3/10 text-center sm:text-right font-medium mt-1 sm:mt-0">
        <span className="text-white">
          Powered by Ban KSNB - Tập đoàn Đại Dũng 2025
        </span>
      </div>
    </div>
    <style jsx>{`
      @media (min-width: 640px) {
        .sm\\:w-7\\/10 {
          width: 70%;
        }
        .sm\\:w-3\\/10 {
          width: 30%;
        }
      }
    `}</style>
    <style jsx>{`
      footer {
        font-size: 60%;
      }
      @media (max-width: 640px) {
        footer {
          font-size: 48%;
          padding-bottom: env(safe-area-inset-bottom, 12px);
        }
        .font-semibold {
          font-size: 0.85rem;
        }
        .text-xs {
          font-size: 0.7rem;
        }
      }
    `}</style>
  </footer>
);

export default AppFooter;
