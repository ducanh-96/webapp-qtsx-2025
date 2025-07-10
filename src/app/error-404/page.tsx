'use client';

import React from 'react';
import Link from 'next/link';

export default function Error404Page() {
  return (
    <div className="min-h-0 flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-red-50 to-white px-2 sm:px-4">
      {/* SVG background */}
      <svg
        className="absolute left-0 top-0 w-full h-full pointer-events-none select-none"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        <circle
          cx="1200"
          cy="200"
          r="300"
          fill="#fee2e2"
          fillOpacity="0.5"
          className="animate-float1"
        />
        <circle
          cx="200"
          cy="800"
          r="250"
          fill="#fca5a5"
          fillOpacity="0.3"
          className="animate-float2"
        />
        <ellipse
          cx="800"
          cy="900"
          rx="400"
          ry="80"
          fill="#f87171"
          fillOpacity="0.12"
          className="animate-float3"
        />
        <ellipse
          cx="0"
          cy="0"
          rx="300"
          ry="80"
          fill="#f87171"
          fillOpacity="0.08"
          className="animate-float4"
        />
      </svg>
      <style jsx global>{`
        @keyframes float1 {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-18px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes float2 {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(12px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes float3 {
          0% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(24px);
          }
          100% {
            transform: translateX(0px);
          }
        }
        @keyframes float4 {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float1 {
          animation: float1 6s ease-in-out infinite;
        }
        .animate-float2 {
          animation: float2 7s ease-in-out infinite;
        }
        .animate-float3 {
          animation: float3 8s ease-in-out infinite;
        }
        .animate-float4 {
          animation: float4 5s ease-in-out infinite;
        }
      `}</style>
      <div className="w-full max-w-lg sm:max-w-2xl flex flex-col items-center relative z-10">
        <div className="text-[80px] sm:text-[120px] font-extrabold text-red-200 leading-none select-none drop-shadow-lg">
          404
        </div>
        <div className="text-xl sm:text-3xl font-bold text-red-700 mb-2 text-center">
          Không tìm thấy trang
        </div>
        <div className="text-sm sm:text-base text-gray-500 mb-6 text-center max-w-full sm:max-w-xl">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          <br />
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
