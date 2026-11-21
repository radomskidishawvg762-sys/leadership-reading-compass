import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { advanceReport, type ReportAction, type ReportStage } from '@/lib/report-workflow';

const key = 'market-report-demo-stage';
const Publication = createContext<{stage:ReportStage; advance:(action:ReportAction)=>void; reset:()=>void}>({
  stage:'pending', advance:()=>{}, reset:()=>{},
});

export function ReportPublication({children}:{children:ReactNode}) {
  const [stage,setStage] = useState<ReportStage>('pending');
  const [ready,setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === 'pending' || saved === 'review' || saved === 'approved' || saved === 'published') setStage(saved);
    } catch { /* The demonstration remains usable without storage. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(key,stage); } catch { /* Keep session state. */ }
  },[ready,stage]);
  return <Publication.Provider value={{stage,advance:action=>setStage(current=>advanceReport(current,action)),reset:()=>setStage('pending')}}>
    {children}
  </Publication.Provider>;
}

export const usePublication = () => useContext(Publication);
