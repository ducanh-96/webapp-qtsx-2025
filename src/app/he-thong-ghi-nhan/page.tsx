'use client';

import React from 'react';

const treeList = [
  {
    label: 'HỒ SƠ THANH TOÁN',
    children: [
      {
        label: 'BAN TGĐ',
        link: 'https://docs.google.com/spreadsheets/d/1JUwGzLv69XCdJXjKD8wddiQOnFeWYVYZwGS-txqZfWY/edit?usp=drive_link',
      },
      {
        label: 'TỔ TRỢ LÝ',
        link: 'https://docs.google.com/spreadsheets/d/1JO-PI9UO7Xo5US71dBDQS9AFI570EqMhZZpxSHKjhf0/edit?usp=drive_link',
      },
      {
        label: 'B KSNB',
        link: 'https://docs.google.com/spreadsheets/d/1RJFaBq4oVn8A4Eiv4tNd9iVgvHUT5M8aQJNG2L88yZU/edit?usp=drive_link',
      },
      {
        label: 'AN HẠ',
        link: 'https://docs.google.com/spreadsheets/d/1LjXZv57mKRa9LEIVDMhcVvdFPhT-1ODTeVL13IDL7C8/edit?usp=drive_link',
      },
      {
        label: 'LONG AN',
        link: 'https://docs.google.com/spreadsheets/d/18CLMkODXjP7X0foIdzaAm2pbFhd2BHqKJUuIRTOAN6Q/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG',
        link: 'https://docs.google.com/spreadsheets/d/1LjXZv57mKRa9LEIVDMhcVvdFPhT-1ODTeVL13IDL7C8/edit?usp=drive_link',
      },
    ],
  },
  {
    label: 'HSE-5S',
    children: [
      {
        label: 'AN HẠ',
        link: 'https://docs.google.com/spreadsheets/d/19IKMgNDvWZeLIFa-7X-AYICC4SDzMvJ4LVUPAjH4eYg/edit#gid=130019202',
      },
      {
        label: 'LONG AN',
        link: 'https://docs.google.com/spreadsheets/d/1t7qBe89Zn_DpMIkU67rw3RcIYsuWlpL9l1I2DybVK3o/edit#gid=130019202',
      },
      {
        label: 'MIỀN TRUNG',
        link: 'https://docs.google.com/spreadsheets/d/1-V3Xo5DWPFTIrtIkoflcsn3tYSnvf_HRpxbBlowmr58/edit#gid=130019202',
      },
    ],
  },
  {
    label: 'SHOP DRAWING',
    children: [
      {
        label: 'WEB APP',
        link: 'https://script.google.com/a/macros/daidung.vn/s/AKfycby0pAvN2BgbMJMKa_oe4yEU6cnukurrxVZApYJr0UgR2Hs2n622Ejn6aMpbBPhGY7su/exec',
      },
    ],
  },
  {
    label: 'MMTB',
    children: [
      {
        label: 'WEB APP',
        link: 'https://script.google.com/a/macros/daidung.vn/s/AKfycbzXzT6qfNMWIiZi93EcMIU8q60yu7ZY-TOWRxLTiDwh9xex-TWIeNhAlooD5nNPMUfOiw/exec',
      },
    ],
  },
  {
    label: 'NĂNG SUẤT',
    children: [
      {
        label: 'AN HẠ - AH1',
        link: 'https://docs.google.com/spreadsheets/d/1XdcmprnMYLUEMTjCEsV-60oUXTe6SKg4s5Z1jI2ITmk/edit?usp=drive_link',
      },
      {
        label: 'AN HẠ - AH2',
        link: 'https://docs.google.com/spreadsheets/d/1Uv7ssFH0YcWQNljg2ySFDNySlSnTJ4LZjYq3PdplgTM/edit?usp=drive_link',
      },
      {
        label: 'AN HẠ - AH2 - SC',
        link: 'https://docs.google.com/spreadsheets/d/1aBNr-fy23znStzwbePnytxDQ0_VCd4RJCYLLNOhXmFo/edit?usp=drive_link',
      },
      {
        label: 'AN HẠ - AH3',
        link: 'https://docs.google.com/spreadsheets/d/1sMN1WU87dU2xNFy25xMmp5GT0jUjSkggHKzqu4TxmKs/edit?usp=drive_link',
      },
      {
        label: 'AN HẠ - AH4',
        link: 'https://docs.google.com/spreadsheets/d/1m46nuUNXab3GTRplfnDj4w5PbtsRRphxcqWEiTt4Vao/edit?usp=drive_link',
      },
      {
        label: 'AN HẠ - AH6',
        link: 'https://docs.google.com/spreadsheets/d/1S_vT2b53AjrEehq7_-9_rAqdnvtPqIEyYfoI3zG5Hb0/edit?usp=drive_link',
      },
      {
        label: 'BÌNH CHÁNH',
        link: 'https://docs.google.com/spreadsheets/d/1yqdPPbXFh7c__434NeBoexdeFwuBKguYt7yBx0ZRRxI/edit?usp=drive_link',
      },
      {
        label: 'BÌNH CHÁNH - SC',
        link: 'https://docs.google.com/spreadsheets/d/1oem7ktfHOOrqKXce9ye46s_XOL4OKqJaf3cqBPU_b-g/edit?usp=drive_link',
      },
      {
        label: 'LONG AN - LA1',
        link: 'https://docs.google.com/spreadsheets/d/1STRP9yXxY6h5lqyxJCGeqmXWH1t0dwudE_mgHj52kFQ/edit?usp=drive_link',
      },
      {
        label: 'LONG AN - LA2',
        link: 'https://docs.google.com/spreadsheets/d/11K0r8wTbIHICAVH54IsT5By8ddL24uCOLBPaBCeTaAE/edit?usp=drive_link',
      },
      {
        label: 'LONG AN - LA3',
        link: 'https://docs.google.com/spreadsheets/d/1oLhoQDH6rYAvEgt0mTsTFEsRuvUuR2ZyGVJrkzjLHlY/edit?usp=drive_link',
      },
      {
        label: 'LONG AN - LA4',
        link: 'https://docs.google.com/spreadsheets/d/1Y99S3LxCCR5Tyl0Z37k_-H2udpVpiygaIlGN1C6TntI/edit?usp=drive_link',
      },
      {
        label: 'LONG AN - LA5',
        link: 'https://docs.google.com/spreadsheets/d/1uybXO2jw_YyY3a429R2EFwBBj4-MyAKUh1G7ffW6Y2E/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG - MT1',
        link: 'https://docs.google.com/spreadsheets/d/1SMOO_MJRo80VG7oZwqD4gnBxXZL1rRJRQfHbwOHmcow/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG - MT2',
        link: 'https://docs.google.com/spreadsheets/d/1uKfnVpVU2yvjVX_xGyqapOYdg_zodID4dnNToGk0aJQ/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG - MT2 - SC',
        link: 'https://docs.google.com/spreadsheets/d/1YUW8rv2tNFBURtnljU6QmhJHDyJ-PaVKOyTbCWocHdA/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG - MT3',
        link: 'https://docs.google.com/spreadsheets/d/1ftYkykEg74zE2wGdFPh9mGad-QVdoBHV71Jqpe5bkec/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG - MT5',
        link: 'https://docs.google.com/spreadsheets/d/15CV184QZfUYRMZwh7wJv-dXsbYVkcg3EdCsnTYU6_Nc/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG - MT5 - SC',
        link: 'https://docs.google.com/spreadsheets/d/17Fm1Ar_gMKCC1BQaMY_gNQAYLZlumsWGwJgl4dAvolk/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG - MT6',
        link: 'https://docs.google.com/spreadsheets/d/1oldVTAnBvrn-vU1rzApz8wcH-K-ujaC0I4XwYvJh9ZY/edit?usp=drive_link',
      },
      {
        label: 'MIỀN TRUNG - MTSC',
        link: 'https://docs.google.com/spreadsheets/d/1AWlc2A-5zSIbWLKBfnRfOHVb_wF7T3pB-wZu5wkFd28/edit?usp=drive_link',
      },
    ],
  },
  {
    label: 'HỒ SƠ TRÌNH KÝ',
    children: [
      {
        label: 'BAN TGĐ',
        link: 'https://docs.google.com/spreadsheets/d/1gnssN2_JedP3NM6MVqm1U9NzNYjItJVjqdiq3DLl3-I/edit?gid=1485557851#gid=1485557851',
      },
      {
        label: 'TỔ TRỢ LÝ',
        link: 'https://docs.google.com/spreadsheets/d/1eZp28MbcwOtgJforAEDlNnvzhnhT7g97Ryeh4TyFBOM/edit?gid=1485557851#gid=1485557851',
      },
      {
        label: 'ADMIN',
        link: 'https://docs.google.com/spreadsheets/d/147RN4cqYueI7R0pO6LrGkFB_6vUU19UNP36wYJvwm3E/edit?gid=1485557851#gid=1485557851',
      },
      {
        label: 'CÁC PHÒNG BAN',
        link: 'https://drive.google.com/drive/folders/100dVWyO9bQF3a60JwIB2WQi-r3keGO9_',
      },
    ],
  },
];

/* Đã gắn link trực tiếp vào treeList, không cần hàm ánh xạ biến môi trường nữa */

type TreeNodeType = {
  label: string;
  children?: { label: string; link?: string }[];
};

function TreeNode({ node }: { node: TreeNodeType }) {
  return (
    <div className="rounded-xl shadow-md bg-gradient-to-br from-red-50 to-white p-2 sm:p-4 mb-2 min-w-0 w-full flex flex-col h-[380px] sm:h-[380px] max-w-full overflow-hidden">
      <div className="flex items-center mb-3">
        <span className="inline-block w-2 h-6 bg-red-500 rounded-r mr-2"></span>
        <span className="font-bold text-base sm:text-lg text-red-800 tracking-wide truncate">
          {node.label}
        </span>
      </div>
      {node.children && (
        <ul className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {node.children.map(child => (
            <li key={node.label + '-' + child.label}>
              {child.link ? (
                <a
                  href={child.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2 py-2 sm:px-3 rounded-lg bg-white hover:bg-red-100 transition text-red-700 font-medium shadow-sm border border-red-100 truncate"
                  style={{ maxWidth: '100%' }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 17l5-5-5-5"
                    />
                  </svg>
                  <span className="truncate">{child.label}</span>
                </a>
              ) : (
                <span className="px-2 py-2 sm:px-3 rounded-lg bg-gray-100 text-gray-500 truncate">
                  {child.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function HeThongGhiNhanPage() {
  return (
    <div className="w-full min-h-0 flex-1 bg-gradient-to-br from-red-100 to-white flex flex-col overflow-x-hidden">
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="w-full max-w-6xl px-2 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
            {treeList.map(tree => (
              <TreeNode node={tree} key={tree.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  <style jsx global>{`
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #f87171 #fff;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      background: #fff;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #f87171;
      border-radius: 6px;
    }
  `}</style>;
}
