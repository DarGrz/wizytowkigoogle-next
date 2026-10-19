import {z} from 'zod';import {serviceIds} from './content';
import { orderServices } from './order-services';
import { isEligiblePortalProfileCompany, normalizeNip, validNip } from './company';
import { isOutcomeService, isReviewPortal, type ReputationTarget } from './reputation-pricing';
const optionalUrl=z.string().trim().max(1500).refine(s=>!s||/^https?:\/\//i.test(s)&&(()=>{try{return Boolean(new URL(s).hostname)}catch{return false}})(),'Podaj poprawny link https://');
export const orderSchema=z.object({
  service:z.string().refine(s=>serviceIds.includes(s)),
  company:z.string().trim().min(2).max(200),
  email:z.email().max(254),
  phone:z.string().trim().min(7).max(30).regex(/^[+\d\s()-]+$/),
  profileUrl:optionalUrl,
  keywords:z.string().trim().max(1000),
  description:z.string().trim().max(5000),
  privacy:z.literal(true),
  website:z.string().max(0),
  requestId:z.uuid(),
  attribution:z.record(z.string().max(40),z.string().max(1000)).optional(),
  analyticsConsent:z.boolean().default(false),
  context:z.enum(['google','reputation']).optional(),
  businessSource:z.enum(['google','portals']).optional(),
  target:z.enum(['reviews','profile']).optional(),
  portal:z.string().max(40).optional(),
  portals:z.array(z.string().max(40)).max(7).optional(),
  billingDetails:z.object({
    name:z.string().trim().min(2).max(200),
    nip:z.string().trim().max(20).refine(value=>!value||validNip(value),'Podaj prawidłowy NIP.').transform(value=>value?normalizeNip(value):''),
    address:z.string().trim().min(3).max(500),
  }).nullable().optional(),
  registryCompany:z.object({
    name:z.string().trim().min(2).max(200),
    nip:z.string().refine(validNip),
    regon:z.string().regex(/^\d{9}(?:\d{5})?$/),
    address:z.string().max(500),
    legalForm:z.enum(['sole-trader','civil-partnership','other','unknown']).optional(),
    legalFormLabel:z.string().max(300).optional(),
    legalFormCode:z.string().regex(/^\d{3}$/).optional(),
  }).optional(),
}).superRefine((data,ctx)=>{
  if(data.context && (!data.businessSource || (data.context==='google' && data.businessSource!=='google') || !orderServices(data.context,data.businessSource,data.service).some(s=>s.id===data.service))){
    ctx.addIssue({code:'custom',path:['service'],message:'Wybierz usługę dostępną dla tego formularza i źródła.'});
  }
  if(data.businessSource && !data.context){
    ctx.addIssue({code:'custom',path:['context'],message:'Brak kontekstu formularza.'});
  }
  if(data.context==='reputation' && data.businessSource) {
    if(!data.target || !data.portal || !isReviewPortal(data.portal)){
      ctx.addIssue({code:'custom',path:['portal'],message:'Wybierz rodzaj zgłoszenia i obsługiwany portal.'});
    } else {
      const portalExpected=data.businessSource==='google'?'google':data.portal;
      const selectedPortals=(data.portals || [data.portal]).filter(isReviewPortal);
      const invalidPortalList=selectedPortals.length===0 ||
        selectedPortals.length!==(data.portals || [data.portal]).length ||
        new Set(selectedPortals).size!==selectedPortals.length ||
        selectedPortals[0]!==data.portal ||
        (data.target==='profile' && data.businessSource==='portals' && !data.portals?.length) ||
        (data.target==='reviews' && selectedPortals.length!==1) ||
        (data.businessSource==='google' && (selectedPortals.length!==1 || selectedPortals[0]!=='google'));
      const targetService=data.target==='reviews'
        ? data.businessSource==='google'?'usuwanie-opinii':'usuwanie-opinii-portale'
        : data.businessSource==='google'?'usuwanie-wizytowki':'usuwanie-profili';
      const legacyGoWorkService=data.target==='profile' && data.businessSource==='portals' &&
        data.service==='usuwanie-profilu-gowork' && portalExpected==='gowork' && selectedPortals.length===1;
      if(data.portal!==portalExpected || invalidPortalList || (data.service!==targetService && !legacyGoWorkService)){
        ctx.addIssue({code:'custom',path:['service'],message:'Usługa nie pasuje do wybranego portalu.'});
      }
      if(data.target==='profile' && data.businessSource==='portals' && data.profileUrl){
        ctx.addIssue({code:'custom',path:['profileUrl'],message:'Do usunięcia profilu na portalu nie jest potrzebny link.'});
      }
      if(data.target==='profile' && data.businessSource==='portals' && !isEligiblePortalProfileCompany(data.registryCompany)){
        ctx.addIssue({code:'custom',path:['registryCompany'],message:'Usuwanie profili na portalach jest dostępne wyłącznie dla JDG i spółek cywilnych potwierdzonych w CEIDG.'});
      }
      if(isOutcomeService(data.service) && data.target!=='reviews'){
        ctx.addIssue({code:'custom',path:['target'],message:'Rozliczenie za rezultat dotyczy wyłącznie usuwania opinii.'});
      }
    }
  }
  if(data.registryCompany && (data.businessSource!=='portals' || data.registryCompany.name!==data.company)){
    ctx.addIssue({code:'custom',path:['registryCompany'],message:'Wybierz ponownie firmę z GUS.'});
  }
}).transform(data=>({
  ...data,
  description:[
    data.businessSource ? `Źródło zgłoszenia: ${data.businessSource==='portals'?'Portale z opiniami':'Mapy Google'}.` : '',
    data.portal ? `Portal: ${data.portal}.` : '',
    data.portals?.length ? `Wybrane portale: ${data.portals.join(', ')}.` : '',
    data.target ? `Zakres: ${data.target==='reviews'?'usuwanie opinii':'usuwanie profilu firmy'}.` : '',
    data.registryCompany ? `Dane firmy z wyszukiwarki GUS (przekazane w formularzu): ${data.registryCompany.name}; NIP: ${data.registryCompany.nip}; REGON: ${data.registryCompany.regon}; adres: ${data.registryCompany.address}.` : '',
    data.registryCompany?.legalFormLabel ? `Forma prawna według danych formularza: ${data.registryCompany.legalFormLabel} (${data.registryCompany.legalFormCode || 'brak kodu'}).` : '',
    data.description,
  ].filter(Boolean).join('\n\n'),
}));
export type OrderInput = z.input<typeof orderSchema>;
export type ValidatedOrder = z.output<typeof orderSchema> & {target?: ReputationTarget};
export function canTransition(from:string,to:string){const allowed:Record<string,string[]>={nowe:['weryfikacja','anulowane'],weryfikacja:['realizacja','anulowane'],realizacja:['efekt','anulowane'],efekt:['rozliczone','realizacja'],rozliczone:[],anulowane:[]};return from===to||Boolean(allowed[from]?.includes(to));}
