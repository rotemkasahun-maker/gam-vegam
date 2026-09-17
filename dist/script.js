const sheet=document.querySelector('.sheet'), scrim=document.querySelector('.scrim'), toast=document.querySelector('.toast');
function openSheet(){sheet.classList.add('open');scrim.classList.add('open')}
function closeSheet(){sheet.classList.remove('open');scrim.classList.remove('open')}
document.querySelectorAll('[data-open-start]').forEach(b=>b.addEventListener('click',openSheet));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeSheet));
document.querySelectorAll('[data-inspiration]').forEach(b=>b.addEventListener('click',()=>{toast.textContent='ספריית ההשראה תיפתח כאן בהמשך';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}));
document.querySelector('[data-join]').addEventListener('click',()=>{toast.textContent='כדי להצטרף, נבקש לפתוח חשבון קצר';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)});
document.querySelectorAll('.sheet-options button').forEach(b=>b.addEventListener('click',()=>{closeSheet();toast.textContent='נשמור את הבחירה שלך ונמשיך משם';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}));
