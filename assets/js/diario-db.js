
const DB_NAME = "EcoVidaKidsDB";
const DB_VERSION = 1;
const STORE = "diaryEntries";

function openDiaryDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)){db.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});}};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
}
async function addDiaryEntry(entry){
  const db=await openDiaryDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).add(entry);
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
}
async function updateDiaryEntry(entry){
  const db=await openDiaryDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(entry);
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
}
async function getDiaryEntries(){
  const db=await openDiaryDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(STORE,"readonly").objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));req.onerror=()=>reject(req.error);
  });
}
async function getDiaryEntry(id){
  const db=await openDiaryDB();
  return new Promise((resolve,reject)=>{
    const req=db.transaction(STORE,"readonly").objectStore(STORE).get(Number(id));
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
}
async function deleteDiaryEntry(id){
  const db=await openDiaryDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(Number(id));
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
}
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{if(!file){resolve("");return;}const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
}
function formatDiaryDate(value){
  return new Intl.DateTimeFormat("pt-BR",{dateStyle:"long",timeStyle:"short"}).format(new Date(value));
}
