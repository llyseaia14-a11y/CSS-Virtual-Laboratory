// script.js - top-down drag/drop logic

document.addEventListener('DOMContentLoaded', () => {
  const draggableItems = document.querySelectorAll('.part-item');
  const dropZones = document.querySelectorAll('.drop-zone');
  const popup = document.getElementById('popup');
  const resetBtn = document.getElementById('resetBtn');
  const progressFill = document.getElementById('progressFill');
  const percentText = document.getElementById('percentText');

  // state
  const items = ['cpu','fan','ram','gpu','ssd','cables','psu'];
  const placed = {}; // zoneId -> part
  const zoneByAccept = {}; // accept -> zone element
  dropZones.forEach(z => zoneByAccept[z.dataset.accept] = z);

  // small pool of positive messages (you can change)
  const messages = ['Nice!','Good job!','Well done!','Perfect!','Great!','Awesome!'];

  // draggable handlers
  draggableItems.forEach(item => {
    item.addEventListener('dragstart', onDragStart);
    item.addEventListener('dragend', onDragEnd);
  });

  // drop handlers
  dropZones.forEach(zone => {
    zone.addEventListener('dragenter', onDragEnter);
    zone.addEventListener('dragover', onDragOver);
    zone.addEventListener('dragleave', onDragLeave);
    zone.addEventListener('drop', onDrop);
  });

  // allow dropping onto board area only (prevent body scroll)
  document.querySelector('.board-wrap').addEventListener('dragover', e => e.preventDefault());

  function onDragStart(e){
    const part = e.currentTarget.dataset.part;
    e.dataTransfer.setData('text/plain', part);
    // add dragging visual
    e.currentTarget.classList.add('dragging');
  }
  function onDragEnd(e){
    e.currentTarget.classList.remove('dragging');
  }

  function onDragEnter(e){ e.preventDefault(); this.classList.add('highlight'); }
  function onDragOver(e){ e.preventDefault(); }
  function onDragLeave(e){ this.classList.remove('highlight'); }

  function onDrop(e){
    e.preventDefault();
    this.classList.remove('highlight');

    const part = e.dataTransfer.getData('text/plain'); // e.g. 'cpu'
    const accept = this.dataset.accept;

    // if zone already has something, reject
    if (this.classList.contains('filled')){
      // brief shake or feedback
      flashMessage('Already filled', true);
      return;
    }

    // validate
    if (part !== accept){
      // wrong zone -> brief red highlight
      this.style.transition = 'box-shadow .15s';
      this.style.boxShadow = '0 0 0 4px rgba(255,90,90,0.12)';
      setTimeout(()=> this.style.boxShadow = '', 400);
      flashMessage('Try again', true);
      return;
    }

    // correct drop: clone icon into zone
    placePartInZone(part, this);
    markDone(part);
    showPopupRandom();
    updateProgress();
  }

  function placePartInZone(part, zone){
    // clone the original part's image (to keep original in left column)
    const origin = document.querySelector(`.part-item[data-part="${part}"] img`);
    const placedWrap = document.createElement('div');
    placedWrap.className = 'placed';
    const img = document.createElement('img');
    img.src = origin.src;
    img.alt = part;
    placedWrap.appendChild(img);

    // small success badge
    const tick = document.createElement('div');
    tick.style.position='absolute';
    tick.style.right='8px'; tick.style.top='8px';
    tick.innerHTML = '✔';
    tick.style.background = '#2db86c';
    tick.style.color = '#fff';
    tick.style.width = '22px';
    tick.style.height = '22px';
    tick.style.borderRadius = '50%';
    tick.style.display = 'flex';
    tick.style.alignItems='center';
    tick.style.justifyContent='center';
    tick.style.fontSize='13px';
    tick.style.boxShadow='0 6px 12px rgba(0,0,0,0.08)';
    placedWrap.appendChild(tick);

    zone.appendChild(placedWrap);
    zone.classList.add('filled');

    // mark state
    placed[zone.id] = part;
  }

  function markDone(part){
    const stat = document.getElementById('stat-'+part);
    if(stat){
      stat.classList.remove('pending');
      stat.classList.add('done');
      stat.textContent = 'Done';
    }
  }

  function updateProgress(){
    const doneCount = Object.keys(placed).length;
    const pct = Math.round((doneCount / items.length) * 100);
    progressFill.style.width = pct + '%';
    percentText.textContent = pct + '%';
    if(pct === 100) flashMessage('Assembly complete — well done!');
  }

  // popup bubble center (good job)
  let popupTimer = null;
  function showPopupRandom(){
    const txt = messages[Math.floor(Math.random()*messages.length)];
    showPopup(txt);
  }
  function showPopup(text){
    clearTimeout(popupTimer);
    popup.textContent = text;
    popup.classList.remove('hidden');
    popup.classList.add('show');
    popupTimer = setTimeout(()=> {
      popup.classList.remove('show');
      popup.classList.add('hidden');
    }, 1400);
  }

  function flashMessage(msg, isError){
    // small top-left toast (re-using popup but with style)
    popup.textContent = msg;
    popup.style.background = isError ? 'rgba(255,245,245,0.98)' : 'rgba(255,255,255,0.98)';
    popup.style.color = isError ? '#b02323' : '#155';
    popup.classList.remove('hidden');
    popup.classList.add('show');
    clearTimeout(popupTimer);
    popupTimer = setTimeout(()=> {
      popup.classList.remove('show');
      popup.classList.add('hidden');
      popup.style.background=''; popup.style.color='';
    }, 900);
  }

  // reset action
  resetBtn.addEventListener('click', resetAll);

  function resetAll(){
    // remove placed elements
    dropZones.forEach(z => {
      z.classList.remove('filled','highlight');
      z.querySelectorAll('.placed').forEach(n=>n.remove());
    });
    // clear state & UI stats
    Object.keys(placed).forEach(k=>delete placed[k]);
    items.forEach(p=>{
      const stat = document.getElementById('stat-'+p);
      if(stat){ stat.classList.remove('done'); stat.classList.add('pending'); stat.textContent='Pending' }
    });
    progressFill.style.width='0%';
    percentText.textContent='0%';
  }

  // prevent default for dragover on board area so drop works
  document.querySelector('.board-wrap').addEventListener('dragover', e=>e.preventDefault());

  // make left part clones draggable even after they are dragged (original stays)
  // (HTML5 native drag already moves; nothing else required)
});

// topdown-slots.js
document.addEventListener('DOMContentLoaded', () => {
  const parts = Array.from(document.querySelectorAll('.part'));
  const dropzones = Array.from(document.querySelectorAll('.dropzone'));
  const progressListItems = Array.from(document.querySelectorAll('.progress-list li'));
  const progressFill = document.getElementById('progressFill');
  const popup = document.getElementById('feedbackPopup');

  let draggingPart = null;

  parts.forEach(p => {
    p.addEventListener('dragstart', e => {
      draggingPart = p;
      p.classList.add('dragging');
      e.dataTransfer.setData('text/plain', p.dataset.part);
      // custom drag image
      if (p.querySelector('img')) {
        const img = p.querySelector('img');
        e.dataTransfer.setDragImage(img, img.width/2, img.height/2);
      }
    });
    p.addEventListener('dragend', () => { draggingPart = null; p.classList.remove('dragging'); });
  });

  dropzones.forEach(dz => {
    dz.addEventListener('dragover', e => {
      e.preventDefault();
      if (!dz.classList.contains('occupied')) dz.classList.add('over');
    });
    dz.addEventListener('dragleave', () => { dz.classList.remove('over'); });
    dz.addEventListener('drop', e => {
      e.preventDefault();
      dz.classList.remove('over');
      if (!draggingPart) return;

      const partName = draggingPart.dataset.part;
      const slotName = dz.dataset.slot;

      if (partName === slotName) {
        // correct
        dz.classList.add('occupied');
        // create placed image inside dropzone
        const img = draggingPart.querySelector('img').cloneNode(true);
        img.classList.add('placed');
        // size adjust
        img.style.width = '100%';
        img.style.height = '100%';
        // remove any existing children
        dz.innerHTML = '';
        dz.appendChild(img);

        // mark progress item
        const li = progressListItems.find(x => x.dataset.part === partName);
        if (li) {
          li.querySelector('.status').textContent = 'Done';
          li.querySelector('.status').style.color = '#27c13f';
        }

        // prevent the original draggable from being used again
        draggingPart.style.opacity = '0.35';
        draggingPart.draggable = false;
        draggingPart.classList.add('snapped');

        // update progress bar
        updateProgress();

        // show popup
        showPopup('🎉 Good job!');

        // optional: play success sound
        playSound('assets/success.mp3'); // add this file to assets (or remove line)

      } else {
        // wrong place - brief shake & show message
        dz.classList.add('wrong-try');
        showPopup('❌ Wrong slot', 1000);
        playSound('assets/wrong.mp3'); // optional
        setTimeout(()=> dz.classList.remove('wrong-try'), 800);
      }
    });
  });

  function updateProgress(){
    const total = progressListItems.length;
    const done = progressListItems.filter(li => li.querySelector('.status').textContent === 'Done').length;
    const pct = Math.round((done/total)*100);
    progressFill.style.width = pct + '%';
  }

  function showPopup(text, ms = 1500){
    popup.textContent = text;
    popup.style.display = 'block';
    popup.style.transform = 'translate(-50%,-50%) scale(1)';
    setTimeout(() => {
      popup.style.transform = 'translate(-50%,-50%) scale(0.92)';
      popup.style.opacity = '0';
    }, ms - 200);
    setTimeout(() => {
      popup.style.display = 'none';
      popup.style.opacity = '1';
      popup.style.transform = 'translate(-50%,-50%) scale(1)';
    }, ms);
  }

  function playSound(path){
    try {
      const s = new Audio(path);
      s.volume = 0.8;
      s.play().catch(()=>{/*ignore autoplay errors*/});
    } catch(e){}
  }

});
