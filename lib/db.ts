import mysql from 'mysql2/promise';
const g=globalThis as unknown as {wgPool?:mysql.Pool};
export const hasDatabase=()=>Boolean(process.env.DATABASE_URL);
export function pool(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_NOT_CONFIGURED');return g.wgPool??=mysql.createPool({uri:process.env.DATABASE_URL,connectionLimit:8,timezone:'Z',dateStrings:true,decimalNumbers:true});}
export async function rows<T=Record<string,unknown>>(sql:string,args:(string|number|boolean|null)[]=[]):Promise<T[]>{const [r]=await pool().execute(sql,args);return r as T[];}
export async function exec(sql:string,args:(string|number|boolean|null)[]=[]){await pool().execute(sql,args);}
