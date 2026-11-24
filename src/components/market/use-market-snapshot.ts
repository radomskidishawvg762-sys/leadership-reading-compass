import {useEffect,useState,useCallback} from 'react';
import {acceptPublished,type MarketSnapshot} from '@/lib/market-snapshot';
const key='market-v33-published';
export function useMarketSnapshot(){
 const [result,setResult]=useState<MarketSnapshot|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[checkedAt,setCheckedAt]=useState('');
 const load=useCallback(async(refresh=false)=>{
  if(refresh)setBusy(true);setError('');
  try{
   const res=await fetch('/api/market-snapshot',{method:refresh?'POST':'GET',signal:AbortSignal.timeout(refresh?55000:8000)});
   const body=await res.json(),next=acceptPublished(body.snapshot);
   if(next){setResult(next);try{localStorage.setItem(key,JSON.stringify(next))}catch{}}
   if(typeof body.checkedAt==='string')setCheckedAt(body.checkedAt);
   if(!res.ok||body.error)setError(body.error??'暂时无法读取研判');
  }catch{setError('暂时无法读取研判，已保存的内容不受影响');}finally{if(refresh)setBusy(false);}
 },[]);
 useEffect(()=>{try{const saved=acceptPublished(JSON.parse(localStorage.getItem(key)??'null'));if(saved)setResult(saved)}catch{}void load();},[load]);
 return {result,busy,error,checkedAt,run:load};
}
