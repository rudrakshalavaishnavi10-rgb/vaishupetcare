const labels = {owners:"Pet Owners",pets:"Pets",appointments:"Appointments",records:"Medical Records"};
const schemas = {
 owners:[["name","Owner name","text",true],["email","Email address","email"],["phone","Phone number","tel"],["address","Address","textarea",false,true]],
 pets:[["owner_id","Owner ID","number",true],["pet_name","Pet name","text",true],["species","Species","text"],["breed","Breed","text"],["age","Age (years)","number"]],
 appointments:[["pet_id","Pet ID","number",true],["doctor_name","Doctor name","text",true],["appointment_date","Appointment date","date",true],["reason","Reason for visit","textarea",false,true],["status","Status","select",false,false,["Scheduled","Confirmed","Completed","Cancelled"]]],
 records:[["pet_id","Pet ID","number",true],["visit_date","Visit date","date",true],["diagnosis","Diagnosis","text"],["treatment","Treatment","textarea",false,true],["notes","Notes","textarea",false,true]]
};
const columns = {
 owners:["owner_id","name","email","phone","address"],
 pets:["pet_id","pet_name","owner_id","species","breed","age"],
 appointments:["appointment_id","pet_id","doctor_name","appointment_date","reason","status"],
 records:["record_id","pet_id","visit_date","diagnosis","treatment","notes"]
};
let cache = {owners:[],pets:[],appointments:[],records:[]}, editing = null;
const $ = id => document.getElementById(id);
document.getElementById("today").textContent = new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.section)));
function showSection(name){
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===name));
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===name));
 $("pageTitle").textContent=name==="dashboard"?"Dashboard":labels[name];
 if(name!=="dashboard") load(name);
}
async function request(url, options={}){
 const response=await fetch(url,{headers:{"Content-Type":"application/json"},...options});
 const data=await response.json().catch(()=>({message:"Unexpected server response"}));
 if(!response.ok) throw new Error(data.message||"Request failed");
 return data;
}
async function refreshSummary(){
 try{const d=await request("/api/summary");$("countOwners").textContent=d.owners;$("countPets").textContent=d.pets;$("countAppointments").textContent=d.appointments;$("countRecords").textContent=d.records;}
 catch(e){["countOwners","countPets","countAppointments","countRecords"].forEach(id=>$(id).textContent="—");}
}
async function load(resource){
 try{cache[resource]=await request(`/api/${resource}`);render(resource);}
 catch(e){toast("Cannot load data. Check database connection.");$( `body-${resource}`).innerHTML=`<tr><td class="empty" colspan="${columns[resource].length+1}">${escapeHtml(e.message)}</td></tr>`;}
}
function render(resource){
 const rows=cache[resource], body=$(`body-${resource}`);
 $(`total-${resource}`).textContent=`${rows.length} record${rows.length===1?"":"s"}`;
 if(!rows.length){body.innerHTML=`<tr><td class="empty" colspan="${columns[resource].length+1}">No records yet. Use the button above to add your first record.</td></tr>`;return;}
 body.innerHTML=rows.map(row=>`<tr>${columns[resource].map((key,i)=>{
  let value=row[key]??"—";
  if(key==="appointment_date"||key==="visit_date") value=String(value).slice(0,10);
  if(key==="status") return `<td><span class="badge ${String(value).toLowerCase()}">${escapeHtml(value)}</span></td>`;
  return `<td>${escapeHtml(String(value))}</td>`;
 }).join("")}<td><button class="action-btn" onclick="editRecord('${resource}',${row[columns[resource][0]]})">Edit</button><button class="action-btn delete" onclick="deleteRecord('${resource}',${row[columns[resource][0]]})">Delete</button></td></tr>`).join("");
 filterTable(resource);
}
function filterTable(resource){
 const q=($(`search-${resource}`)?.value||"").toLowerCase();
 document.querySelectorAll(`#body-${resource} tr`).forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?"":"none");
}
function openForm(resource,row=null){
 editing=row?row[columns[resource][0]]:null;
 $("modalTitle").textContent=(row?"Edit ":"Add ")+labels[resource].replace(/s$/,"").toLowerCase();
 $("formFields").innerHTML=schemas[resource].map(([key,label,type,required,full,opts])=>{
  const value=row?.[key]??"";
  let input;
  if(type==="select") input=`<select name="${key}" ${required?"required":""}>${opts.map(o=>`<option ${value===o?"selected":""}>${o}</option>`).join("")}</select>`;
  else if(type==="textarea") input=`<textarea name="${key}" ${required?"required":""}>${escapeHtml(String(value))}</textarea>`;
  else input=`<input name="${key}" type="${type}" value="${escapeHtml(String(value))}" ${required?"required":""} ${type==="number"?'min="0"':""}>`;
  return `<div class="field ${full?"full":""}"><label>${label}${required?" *":""}</label>${input}</div>`;
 }).join("");
 $("modal").classList.add("show");
}
function editRecord(resource,id){const row=cache[resource].find(r=>r[columns[resource][0]]===id);openForm(resource,row);}
function closeForm(){$("modal").classList.remove("show");$("dataForm").reset();}
$("dataForm").addEventListener("submit",async e=>{
 e.preventDefault();const resource=document.querySelector(".page.active").id;
 const data=Object.fromEntries(new FormData(e.target).entries());
 for(const k of Object.keys(data)) if(data[k]==="") data[k]=null;
 try{
  await request(`/api/${resource}${editing?"/"+editing:""}`,{method:editing?"PUT":"POST",body:JSON.stringify(data)});
  closeForm();toast(editing?"Record updated successfully":"Record added successfully");await load(resource);refreshSummary();
 }catch(err){toast(err.message);}
});
async function deleteRecord(resource,id){
 if(!confirm("Are you sure you want to delete this record? Related child records may also be deleted."))return;
 try{await request(`/api/${resource}/${id}`,{method:"DELETE"});toast("Record deleted");await load(resource);refreshSummary();}
 catch(e){toast(e.message);}
}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2800);}
function escapeHtml(value){return value.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeForm();});
refreshSummary();