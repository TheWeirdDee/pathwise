import type { CSSProperties } from 'react';
const paths:Record<string,React.ReactNode>={
  route:<><path d="M5 19V9a4 4 0 0 1 4-4h10M15 1l4 4-4 4"/><circle cx="5" cy="19" r="2"/><path d="m10 14 4 4 6-7"/></>,
  grid:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  wallet:<><path d="M20 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-3M3 7h17v10"/><rect x="14" y="10" width="8" height="6" rx="1.5"/><path d="M17 13h.01"/></>,
  receipt:<><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M9 7h6M9 11h6M9 15h3"/></>,
  chart:<><path d="M4 3v17h17M8 15v-4M13 15V6M18 15V9"/></>,
  shield:<><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
  settings:<><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></>,
  arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>, chevron:<path d="m9 5 7 7-7 7"/>,down:<path d="m6 9 6 6 6-6"/>,plus:<path d="M12 5v14M5 12h14"/>,check:<path d="m5 12 4 4L19 6"/>,
  clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  link:<><path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/></>,
  refresh:<><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"/></>,
  external:<><path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></>,stop:<rect x="5" y="5" width="14" height="14" rx="3"/>,
  info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,close:<path d="m6 6 12 12M6 18 18 6"/>,
  copy:<><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>,download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,bolt:<path d="m13 2-9 12h7l-1 8 10-13 10-13h-7l1-7Z"/>,
  search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,code:<><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/></>,
};
export function Icon({name,size=20,className='',style}:{name:string;size?:number;className?:string;style?:CSSProperties}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">{paths[name]??paths.route}</svg>}
