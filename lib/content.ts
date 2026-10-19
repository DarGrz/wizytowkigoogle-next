import serviceDefaults from './services.json';import {defaultPages as pageDefaults} from './service-landings';import {hasDatabase,rows} from './db';import type {Service,ContentPage} from './types';
import catalog from './order-services.json';
export const extraServices=[...catalog.google,...catalog.portals,...catalog.legacy].filter(s=>!serviceDefaults.some(d=>d.id===s.id));
export const serviceIds=[...serviceDefaults.map(s=>s.id),...extraServices.map(s=>s.id)];
export async function services():Promise<Service[]>{if(!hasDatabase())return serviceDefaults;const r=await rows<{id:string;price_cents:number|null;content:string|null}>('SELECT id,price_cents,content FROM services');return serviceDefaults.map(s=>{const v=r.find(x=>x.id===s.id);return {...s,priceCents:v?.price_cents,description:v?.content||s.description}})}
export async function contentPages():Promise<ContentPage[]>{if(!hasDatabase())return pageDefaults;const r=await rows<{slug:string;content:ContentPage|string}>('SELECT slug,content FROM pages');return pageDefaults.map(p=>{const v=r.find(x=>x.slug===p.slug);return v?(typeof v.content==='string'?JSON.parse(v.content):v.content):p})}
export function money(cents:number|null|undefined){return cents==null?'Wycena po weryfikacji':new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(cents/100)+' brutto'}
