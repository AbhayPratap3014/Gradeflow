import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL||'';
const key=import.meta.env.VITE_SUPABASE_ANON_KEY||'';
export const cloud=url&&key?createClient(url,key):null;
export const cloudReady=!!cloud;
export async function logActivity(action:string,entity_type:string,details:any={},source_type='manual',source_ref=''){if(!cloud)return;await cloud.from('activity_log').insert({action,entity_type,details,source_type,source_ref});}
export async function getActivities(){if(!cloud)return[];const{data,error}=await cloud.from('activity_log').select('*').order('created_at',{ascending:false}).limit(100);if(error)throw error;return data||[];}
export async function getDocuments(){if(!cloud)return[];const{data,error}=await cloud.from('documents').select('*').order('pinned',{ascending:false}).order('created_at',{ascending:false});if(error)throw error;return data||[];}
export async function addDocumentMeta(v:any){if(!cloud)throw new Error('Supabase not configured');const{data,error}=await cloud.from('documents').insert(v).select().single();if(error)throw error;await logActivity('Document added','document',{name:v.name,category:v.category,semester:v.semester},'upload',data.id);return data;}
export async function getSnapshots(){if(!cloud)return[];const{data,error}=await cloud.from('semester_snapshots').select('*').order('semester',{ascending:false});if(error)throw error;return data||[];}
export async function saveSnapshot(v:any){if(!cloud)throw new Error('Supabase not configured');const{data,error}=await cloud.from('semester_snapshots').upsert(v,{onConflict:'semester'}).select().single();if(error)throw error;await logActivity('Semester snapshot saved','semester_snapshot',{semester:v.semester,predicted_sgpa:v.predicted_sgpa,actual_sgpa:v.actual_sgpa},'gradeflow',data.id);return data;}
export async function createImport(v:any){if(!cloud)throw new Error('Supabase not configured');const{data,error}=await cloud.from('imports').insert(v).select().single();if(error)throw error;await logActivity('Academic import received','import',{file_name:v.file_name,status:v.status},v.source_type||'manual',data.id);return data;}
export async function saveRule(v:any){if(!cloud)throw new Error('Supabase not configured');const{data,error}=await cloud.from('assessment_rules').insert(v).select().single();if(error)throw error;await logActivity('Assessment rule added','assessment_rule',v,'import',data.id);return data;}
