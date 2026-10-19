import {test} from 'node:test';import assert from 'node:assert/strict';import {orderSchema,canTransition} from '../lib/validation';import {POST} from '../app/api/orders/route';import pages from '../lib/pages.json';
import {googleServices,orderServices,portalServices,reputationGoogleServices} from '../lib/order-services';
const valid={service:'pozycjonowanie',company:'Firma Testowa',email:'test@example.com',phone:'+48 500 600 700',profileUrl:'https://maps.google.com/test',keywords:'fryzjer Kraków',description:'Test',privacy:true,website:'',requestId:'b94ac8b7-749b-4f23-a556-a3b1e5560091'};
test('form accepts ordinary Polish company submission',()=>assert.equal(orderSchema.safeParse(valid).success,true));
test('invoice details can be selected independently and normalize alternate billing data',()=>{
  assert.equal(orderSchema.parse({...valid,billingDetails:null}).billingDetails,null);
  assert.deepEqual(orderSchema.parse({...valid,billingDetails:{name:'Inny podmiot',nip:'526 104 08 28',address:'ul. Testowa 1, 00-001 Warszawa'}}).billingDetails,{name:'Inny podmiot',nip:'5261040828',address:'ul. Testowa 1, 00-001 Warszawa'});
  assert.equal(orderSchema.safeParse({...valid,billingDetails:{name:'Inny podmiot',nip:'1234567890',address:'Warszawa'}}).success,false);
});
test('rejects missing acknowledgement, unknown service, script URL, bot trap and malformed email',()=>{for(const change of [{privacy:false},{service:'unknown'},{profileUrl:'javascript:alert(1)'},{website:'spam'},{email:'bad'}])assert.equal(orderSchema.safeParse({...valid,...change}).success,false)});
test('financial workflow cannot skip effect or reopen settled order',()=>{assert.equal(canTransition('nowe','rozliczone'),false);assert.equal(canTransition('realizacja','rozliczone'),false);assert.equal(canTransition('realizacja','efekt'),true);assert.equal(canTransition('efekt','rozliczone'),true);assert.equal(canTransition('rozliczone','nowe'),false)});
test('all 11 legacy URLs exist and are unique',()=>{const required=['usuwanie-aleo','usuwanie-firmy-z-google','usuwanie-gowork','usuwanie-opinii-formularz','usuwanie-opinii-google','usuwanie-panorama-firm','usuwanie-wizytowki-google','weryfikacja-wizytowek-google','odwieszanie-wizytowek-google','jak-usunac-firme-z-google','usuwanie-opinii-google-cena'];for(const slug of required)assert.ok(pages.some(p=>p.slug===slug+'.html'));assert.equal(new Set(pages.map(p=>p.slug)).size,pages.length)});
test('cross-origin submission is rejected before accessing DB',async()=>{const r=await POST(new Request('http://localhost:3000/api/orders',{method:'POST',headers:{origin:'https://attacker.example'},body:JSON.stringify(valid)}));assert.equal(r.status,403)});
test('unconfigured database does not display fake submission success',async()=>{const previous=process.env.DATABASE_URL;delete process.env.DATABASE_URL;const r=await POST(new Request('http://localhost:3000/api/orders',{method:'POST',headers:{origin:'http://localhost:3000'},body:JSON.stringify(valid)}));assert.equal(r.status,503);if(previous)process.env.DATABASE_URL=previous});
test('homepage offers exactly the five requested Google services',()=>{
  assert.deepEqual(orderServices('google','google').map(s=>s.id),['pozycjonowanie','usuwanie-opinii','google-ads','usuwanie-wizytowki','resetowanie-wizytowki']);
  for(const service of googleServices) assert.equal(orderSchema.safeParse({...valid,context:'google',businessSource:'google',service:service.id}).success,true);
});
test('reputation services follow the selected platform',()=>{
  assert.deepEqual(orderServices('reputation','portals'),portalServices);
  assert.deepEqual(orderServices('reputation','google'),reputationGoogleServices);
  const eligibleCompany={name:valid.company,nip:'5261040828',regon:'000331501',address:'Warszawa',legalForm:'sole-trader' as const};
  const portalOrders=[
    {service:'usuwanie-opinii-portale',target:'reviews',portal:'aleo'},
    {service:'usuwanie-profili',target:'profile',portal:'aleo',portals:['aleo'],registryCompany:eligibleCompany},
    {service:'usuwanie-profili',target:'profile',portal:'gowork',portals:['gowork'],registryCompany:eligibleCompany},
  ];
  for(const order of portalOrders) assert.equal(orderSchema.safeParse({...valid,profileUrl:'',context:'reputation',businessSource:'portals',...order}).success,true);
  for(const portal of ['aleo','gowork','panorama-firm','biznes-finder','pkt-pl','podobne-firmy','puls-biznesu']) {
    assert.equal(orderSchema.safeParse({...valid,context:'reputation',businessSource:'portals',service:'usuwanie-opinii-portale',target:'reviews',portal}).success,true);
  }
  for(const service of ['usuwanie-opinii','usuwanie-wizytowki']) {
    assert.equal(orderSchema.safeParse({...valid,context:'reputation',businessSource:'google',service,target:service==='usuwanie-opinii'?'reviews':'profile',portal:'google'}).success,true);
  }
  for(const legalForm of ['sole-trader','civil-partnership'] as const) {
    assert.equal(orderSchema.safeParse({...valid,profileUrl:'',context:'reputation',businessSource:'portals',service:'usuwanie-profili',target:'profile',portal:'aleo',portals:['aleo'],registryCompany:{...eligibleCompany,legalForm}}).success,true);
  }
  assert.equal(orderSchema.safeParse({...valid,profileUrl:'',context:'reputation',businessSource:'portals',service:'usuwanie-profili',target:'profile',portal:'aleo',portals:['aleo','gowork'],registryCompany:eligibleCompany}).success,true);
  for(const change of [
    {context:'google',businessSource:'portals',service:'usuwanie-profili'},
    {context:'google',businessSource:'google',service:'ochrona-wizerunku'},
    {context:'reputation',businessSource:'google',service:'usuwanie-profili'},
    {context:'reputation',businessSource:'portals',service:'usuwanie-opinii'},
    {context:'reputation',businessSource:'portals',service:'usuwanie-opinii-portale',target:'profile',portal:'aleo'},
    {context:'reputation',businessSource:'portals',service:'usuwanie-profili',target:'profile',portal:'gowork'},
    {context:'reputation',businessSource:'portals',service:'usuwanie-profili',target:'profile',portal:'aleo',portals:['aleo','invalid'],registryCompany:eligibleCompany},
    {context:'reputation',businessSource:'portals',service:'usuwanie-opinii-portale',target:'reviews',portal:'aleo',portals:['aleo','gowork']},
    {context:'reputation',businessSource:'portals',service:'usuwanie-profili',target:'profile',portal:'aleo',registryCompany:{...eligibleCompany,legalForm:'other'}},
    {context:'reputation',businessSource:'portals',service:'usuwanie-profili',target:'profile',portal:'aleo'},
    {context:'reputation',businessSource:'google',service:'google-ads'},
    {context:'reputation',service:'usuwanie-opinii'},
    {businessSource:'portals',service:'usuwanie-profili'},
  ]) assert.equal(orderSchema.safeParse({...valid,...change}).success,false);
});
test('registry identifiers and platform are preserved in the stored description',()=>{
  const input={...valid,profileUrl:'',context:'reputation',businessSource:'portals',service:'usuwanie-profili',target:'profile',portal:'aleo',portals:['aleo'],registryCompany:{name:valid.company,nip:'5261040828',regon:'000331501',address:'Warszawa',legalForm:'civil-partnership' as const}};
  const parsed=orderSchema.parse(input);
  assert.match(parsed.description,/Portale z opiniami/);
  assert.match(parsed.description,/NIP: 5261040828; REGON: 000331501; adres: Warszawa/);
  assert.ok(parsed.description.endsWith(valid.description));
  for(const change of [{company:'Inna firma'},{businessSource:'google'},{registryCompany:{...input.registryCompany,nip:'1234567890'}}]) assert.equal(orderSchema.safeParse({...input,...change}).success,false);
});
test('legacy pages retain their preselected services and manual company entry works',()=>{
  for(const page of pages) {
    if(page.service==='ochrona-wizerunku') continue;
    const portals=portalServices.some(s=>s.id===page.service);
    assert.ok(orderServices(portals?'reputation':'google',portals?'portals':'google',page.service).some(s=>s.id===page.service),page.slug);
  }
  assert.equal(orderSchema.safeParse({...valid,profileUrl:'',context:'reputation',businessSource:'portals',service:'usuwanie-opinii-portale',target:'reviews',portal:'aleo'}).success,true);
});
test('both accepting and declining the profile recommendation preserve legal-form context',()=>{
  const registryCompany={name:valid.company,nip:'5261040828',regon:'000331501',address:'Warszawa',legalForm:'civil-partnership',legalFormCode:'019',legalFormLabel:'SPÓŁKA CYWILNA'};
  for(const [service,target] of [['usuwanie-profili','profile'],['usuwanie-opinii-portale','reviews']] as const){
    const parsed=orderSchema.parse({...valid,profileUrl:'',context:'reputation',businessSource:'portals',registryCompany,service,target,portal:'aleo',portals:['aleo']});
    assert.equal(parsed.service,service);
    assert.match(parsed.description,/Forma prawna według danych formularza: SPÓŁKA CYWILNA \(019\)/);
  }
});
