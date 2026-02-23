let currentUser=null;
let activityLog=[];
let notifications=[];
let chartInstance=null;

function showSection(id){
document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
document.getElementById(id)?.classList.add("active");
}

function toggleTheme(){ document.body.classList.toggle("dark"); }

function register(){
let users=JSON.parse(localStorage.getItem("users"))||[];
users.push({
name:regName.value,
email:regEmail.value,
password:regPassword.value,
role:regRole.value
});
localStorage.setItem("users",JSON.stringify(users));
alert("Registered!");
showSection("login");
}

function login(){
let users=JSON.parse(localStorage.getItem("users"))||[];
let user=users.find(u=>u.email===loginEmail.value&&u.password===loginPassword.value);
if(user){
currentUser=user;
alert("Login success!");
loadProfile();
loadNotifications();
if(user.role==="admin"){showSection("adminPanel");loadPending();}
else{showSection("dashboard");loadUserResources();}
}else alert("Invalid credentials");
}

function logout(){currentUser=null;showSection("home");}

function uploadResource(){
let file=fileInput.files.length?fileInput.files[0].name:"No File";
let resources=JSON.parse(localStorage.getItem("resources"))||[];
resources.push({
title:title.value,
subject:subject.value,
description:description.value,
file:file,
uploadedBy:currentUser.email,
status:"pending"
});
localStorage.setItem("resources",JSON.stringify(resources));
addNotification("Resource submitted for approval.");
logActivity("Uploaded resource: "+title.value);
loadUserResources();
}

function loadUserResources(){
let resources=JSON.parse(localStorage.getItem("resources"))||[];
let div=document.getElementById("userResources");
div.innerHTML="";
resources.filter(r=>r.uploadedBy===currentUser.email)
.forEach((r,i)=>{
div.innerHTML+=`
<div class="card p-3">
<b>${r.title}</b> (${r.subject})
<p>${r.description}</p>
<p>Status: ${r.status}</p>
<button class="btn btn-sm btn-danger" onclick="deleteResource(${i})">Delete</button>
</div>`;
});
}

function deleteResource(i){
let resources=JSON.parse(localStorage.getItem("resources"));
resources.splice(i,1);
localStorage.setItem("resources",JSON.stringify(resources));
loadUserResources();
loadResources();
}

function loadPending(){
let resources=JSON.parse(localStorage.getItem("resources"))||[];
let div=document.getElementById("pendingResources");
div.innerHTML="";
resources.filter(r=>r.status==="pending")
.forEach((r,i)=>{
div.innerHTML+=`
<div class="card p-3">
<b>${r.title}</b>
<button class="btn btn-success btn-sm" onclick="approve(${i})">Approve</button>
<button class="btn btn-danger btn-sm" onclick="reject(${i})">Reject</button>
</div>`;
});
}

function approve(i){
let resources=JSON.parse(localStorage.getItem("resources"));
resources[i].status="approved";
localStorage.setItem("resources",JSON.stringify(resources));
addNotification("Resource approved.");
loadPending();
loadResources();
}

function reject(i){
let resources=JSON.parse(localStorage.getItem("resources"));
resources[i].status="rejected";
localStorage.setItem("resources",JSON.stringify(resources));
loadPending();
}

function loadResources(page=1){
let resources=JSON.parse(localStorage.getItem("resources"))||[];
let approved=resources.filter(r=>r.status==="approved");
let perPage=6;
let start=(page-1)*perPage;
let end=start+perPage;
let div=document.getElementById("resourceList");
div.innerHTML="";
approved.slice(start,end).forEach(r=>{
div.innerHTML+=`
<div class="col-md-4">
<div class="card p-3">
<h5>${r.title}</h5>
<p>${r.subject}</p>
<p>${r.description}</p>
<button class="btn btn-sm btn-info" onclick="downloadFile('${r.file}')">Download</button>
</div></div>`;
});
generateChart();
}

function searchResource(q){
let resources=JSON.parse(localStorage.getItem("resources"))||[];
let div=document.getElementById("resourceList");
div.innerHTML="";
resources.filter(r=>r.status==="approved"&&
(r.title.toLowerCase().includes(q.toLowerCase())||
r.subject.toLowerCase().includes(q.toLowerCase())))
.forEach(r=>{
div.innerHTML+=`
<div class="col-md-4">
<div class="card p-3">
<h5>${r.title}</h5>
<p>${r.subject}</p>
</div></div>`;
});
}

function filterSubject(s){
if(s==="all"){loadResources();return;}
let resources=JSON.parse(localStorage.getItem("resources"))||[];
let div=document.getElementById("resourceList");
div.innerHTML="";
resources.filter(r=>r.status==="approved"&&r.subject===s)
.forEach(r=>{
div.innerHTML+=`
<div class="col-md-4">
<div class="card p-3">
<h5>${r.title}</h5>
<p>${r.subject}</p>
</div></div>`;
});
}

function downloadFile(name){ alert("Downloading: "+name); }

function logActivity(a){
activityLog.push({a,time:new Date().toLocaleString()});
}

function addNotification(msg){
notifications.push(msg);
localStorage.setItem("notifications",JSON.stringify(notifications));
loadNotifications();
}

function loadNotifications(){
notifications=JSON.parse(localStorage.getItem("notifications"))||[];
let div=document.getElementById("notificationList");
div.innerHTML="";
notifications.forEach(n=>{
div.innerHTML+=`<div class="card p-2 mb-2">${n}</div>`;
});
}

function loadProfile(){
profileName.innerText=currentUser.name;
profileEmail.innerText=currentUser.email;
profileRole.innerText=currentUser.role;
}

function generateChart(){
let resources=JSON.parse(localStorage.getItem("resources"))||[];
let approved=resources.filter(r=>r.status==="approved").length;
let pending=resources.filter(r=>r.status==="pending").length;
let rejected=resources.filter(r=>r.status==="rejected").length;

if(chartInstance) chartInstance.destroy();

chartInstance=new Chart(document.getElementById("statsChart"),{
type:'bar',
data:{
labels:['Approved','Pending','Rejected'],
datasets:[{label:'Resources',data:[approved,pending,rejected]}]
}
});
}

loadResources();
