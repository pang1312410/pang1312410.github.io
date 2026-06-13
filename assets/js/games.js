// โค้ดควบคุมระบบมินิเกมส์จำลองและ Interactive Activities สำหรับบทเรียนต่างๆ

// ----------------------------------------------------
// ระบบจำลองเอฟเฟกต์พลุกระดาษฉลองชัย (Confetti Effect)
// ----------------------------------------------------
export function launchConfetti(container) {
  const colors = ['#FFB7D5', '#B19FFB', '#A8E6CF', '#A8DADC', '#FFEBB7'];
  const confettiCount = 80;
  
  // สร้างพื้นที่เอฟเฟกต์ครอบคลุม container
  const rect = container.getBoundingClientRect();
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100vw';
  wrapper.style.height = '100vh';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.zIndex = '9999';
  document.body.appendChild(wrapper);

  for (let i = 0; i < confettiCount; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = Math.random() * 8 + 6 + 'px';
    p.style.height = Math.random() * 12 + 6 + 'px';
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = '3px';
    
    // ตั้งค่าตำแหน่งเริ่มต้นที่จุดกลาง
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    p.style.left = x + 'px';
    p.style.top = y + 'px';

    // ทิศทางความเร็วแบบสุ่มกระจายรอบตัว
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 12 + 8;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 10; // พุ่งขึ้นบนก่อน

    wrapper.appendChild(p);

    let posX = x;
    let posY = y;
    let currentVx = vx;
    let currentVy = vy;
    const gravity = 0.5;
    let opacity = 1;

    const animate = () => {
      posX += currentVx;
      posY += currentVy;
      currentVy += gravity;
      currentVx *= 0.98; // แรงต้านอากาศ
      opacity -= 0.015;

      p.style.left = posX + 'px';
      p.style.top = posY + 'px';
      p.style.opacity = opacity;
      p.style.transform = `rotate(${posY * 2}deg)`;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        p.remove();
      }
    };
    requestAnimationFrame(animate);
  }

  // ลบ wrapper เมื่อจบแอนิเมชัน
  setTimeout(() => wrapper.remove(), 2500);
}

// ----------------------------------------------------
// 1. เกมจำแนกประเภท (Classification Game) - บทที่ 1.1
// ----------------------------------------------------
export function initClassificationGame(container, onComplete) {
  const items = [
    { id: "stone", name: "🪨 ก้อนหิน", category: "natural" },
    { id: "toy", name: "🧸 ตุ๊กตาหมี", category: "manmade" },
    { id: "leaf", name: "🍃 ใบไม้", category: "natural" },
    { id: "cup", name: "🥛 แก้วน้ำแก้ว", category: "manmade" },
    { id: "flower", name: "🌸 ดอกไม้", category: "natural" },
    { id: "pencil", name: "✏️ ดินสอไม้", category: "manmade" }
  ];

  // สุ่มลำดับไอเทม
  const shuffledItems = [...items].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="game-container classification-game">
      <div class="game-instruction">
        <h3>🎯 เกมจำแนกประเภทสิ่งต่าง ๆ</h3>
        <p>ช่วยจัดหมวดหมู่สิ่งของเหล่านี้หน่อยสิครับ! ลากไปวางในตะกร้าที่ถูกต้อง หรือกดปุ่มใต้การ์ดก็ได้นะ</p>
      </div>

      <div class="game-workspace">
        <!-- โซนตระกร้าเป้าหมาย -->
        <div class="baskets-container">
          <div class="basket-dropzone" data-category="natural" id="basket-natural">
            <div class="basket-title">🍃 ธรรมชาติสร้างขึ้น</div>
            <div class="basket-items-list" id="list-natural"></div>
          </div>
          <div class="basket-dropzone" data-category="manmade" id="basket-manmade">
            <div class="basket-title">🛠️ มนุษย์สร้างขึ้น</div>
            <div class="basket-items-list" id="list-manmade"></div>
          </div>
        </div>

        <!-- แผงไอเทมที่จะจัดหมวดหมู่ -->
        <div class="items-to-sort-container" id="items-shelf">
          ${shuffledItems.map(item => `
            <div class="sort-card" draggable="true" id="card-${item.id}" data-id="${item.id}" data-category="${item.category}">
              <span class="card-name">${item.name}</span>
              <div class="mobile-sort-buttons">
                <button class="btn-sort-mob btn-pastel-green" data-target="natural">ธรรมชาติ 🍃</button>
                <button class="btn-sort-mob btn-pastel-purple" data-target="manmade">มนุษย์ทำ 🛠️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="game-feedback" id="game-feedback-msg">จัดกลุ่มสิ่งของให้ครบทุกชิ้นเลยจ้า!</div>
    </div>
  `;

  let dragSrcEl = null;

  // ฟังก์ชันย้ายไอเทมเข้าตระกร้าและตรวจผลลัพธ์
  function moveItem(itemId, targetCategory) {
    const card = container.querySelector(`#card-${itemId}`);
    if (!card) return;

    const itemData = items.find(i => i.id === itemId);
    if (!itemData) return;

    const feedback = container.querySelector('#game-feedback-msg');

    if (itemData.category === targetCategory) {
      // ตอบถูก
      const targetList = container.querySelector(`#list-${targetCategory}`);
      card.setAttribute('draggable', 'false');
      card.querySelector('.mobile-sort-buttons').style.display = 'none';
      card.classList.add('correct-sorted');
      targetList.appendChild(card);
      
      feedback.textContent = `เก่งมาก! ${itemData.name} เป็นสิ่งที่${targetCategory === 'natural' ? 'ธรรมชาติสร้างขึ้น' : 'มนุษย์สร้างขึ้น'}`;
      feedback.style.color = 'var(--success-color-dark)';
      
      // ตรวจสอบว่าจัดหมดหรือยัง
      checkGameFinished();
    } else {
      // ตอบผิด
      card.classList.add('shake-anim');
      setTimeout(() => card.classList.remove('shake-anim'), 500);
      feedback.textContent = `เอ๊ะ! ลองคิดดูอีกทีนะ ${itemData.name} ควรอยู่ในตะกร้าไหนนะ?`;
      feedback.style.color = 'var(--danger-color, #E63946)';
    }
  }

  function checkGameFinished() {
    const remaining = container.querySelector('#items-shelf').children.length;
    if (remaining === 0) {
      const feedback = container.querySelector('#game-feedback-msg');
      feedback.innerHTML = '🎉 <b>ยอดเยี่ยมมาก! คุณแยกประเภทสิ่งต่าง ๆ ได้ถูกต้องครบถ้วนทั้งหมดแล้ว!</b>';
      feedback.style.color = 'var(--success-color-dark)';
      launchConfetti(container);
      if (onComplete) onComplete();
    }
  }

  // --- ตั้งค่า HTML5 Drag and Drop ---
  const cards = container.querySelectorAll('.sort-card');
  cards.forEach(card => {
    card.addEventListener('dragstart', function(e) {
      dragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.dataset.id);
      this.classList.add('dragging');
    });

    card.addEventListener('dragend', function() {
      this.classList.remove('dragging');
    });
  });

  const dropzones = container.querySelectorAll('.basket-dropzone');
  dropzones.forEach(zone => {
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('drag-over');
      return false;
    });

    zone.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      const itemId = e.dataTransfer.getData('text/plain');
      const targetCategory = this.dataset.category;
      moveItem(itemId, targetCategory);
    });
  });

  // --- ตั้งค่าปุ่มกดสำหรับ Mobile/Tablet ---
  container.querySelectorAll('.btn-sort-mob').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.sort-card');
      const itemId = card.dataset.id;
      const targetCategory = this.dataset.target;
      moveItem(itemId, targetCategory);
    });
  });
}

// ----------------------------------------------------
// 2. เกมสืบเสาะหาความรู้ (Inquiry Game) - บทที่ 1.2
// ----------------------------------------------------
export function initInquiryGame(container, onComplete) {
  let currentStep = 1;
  const totalSteps = 5;

  const stepContents = {
    1: {
      title: "❓ ขั้นที่ 1: ตั้งคำถาม (Ask)",
      instruction: "น้องไดโนสังเกตเห็นต้นกะเพราในห้องเรียนแห้งเหี่ยวเฉาและใบเหลืองหมดเลย! ควรตั้งคำถามว่าอย่างไรดีนะ?",
      options: [
        { text: "ทำไมต้นกะเพราถึงแห้งเหี่ยวและเฉาลง?", correct: true },
        { text: "ต้นกะเพรานี้นำมาทำผัดกะเพราอร่อยไหมนะ?", correct: false }
      ],
      correctFeedback: "ถูกต้องจ้า! เราเริ่มสืบเสาะโดยตั้งคำถามถึงสาเหตุที่ต้นกะเพราเหี่ยว"
    },
    2: {
      title: "🔍 ขั้นที่ 2: รวบรวมข้อมูล (Gather Info)",
      instruction: "มาใช้เครื่องมือเก็บข้อมูลกันเถอะ! กดคลิกที่แว่นขยายเพื่อส่องดูสภาพของต้นกะเพราสิครับ",
      tool: "magnifier",
      inspectionDone: false,
      correctFeedback: "เมื่อส่องดูพบว่า: ดินแห้งแข็งเป็นผงมาก และไม่มีร่องรอยของหนอนหรือแมลงเลย!"
    },
    3: {
      title: "🗣️ ขั้นที่ 3: อธิบายข้อมูล (Explain)",
      instruction: "จากข้อมูลที่รวบรวมได้ (ดินแห้งเป็นผง ไม่มีแมลงกัดกิน) เด็กๆ จะอธิบายสาเหตุว่าอย่างไรครับ?",
      options: [
        { text: "ต้นกะเพราเฉาเพราะมีสัตว์แอบมากินรากในเวลากลางคืน", correct: false },
        { text: "ต้นกะเพราเฉาเพราะดินขาดน้ำ คาดว่าไม่มีใครรดน้ำเลย", correct: true }
      ],
      correctFeedback: "เก่งมาก! ดินแห้งคือหลักฐานสำคัญที่อธิบายว่าต้นไม้ขาดน้ำ"
    },
    4: {
      title: "🔗 ขั้นที่ 4: เชื่อมโยงข้อมูล (Connect)",
      instruction: "มาค้นหาความรู้เพิ่มเติมเพื่อยืนยันข้อสรุปของเราสิครับ! ลองเปรียบเทียบกับความจริงทางวิทยาศาสตร์สิว่า ต้นไม้ต้องการอะไรในการเจริญเติบโต?",
      options: [
        { text: "ต้นไม้ต้องการ น้ำ แสงแดด แร่ธาตุ และอากาศในการมีชีวิต", correct: true },
        { text: "ต้นไม้ต้องการแค่นมเย็นและของเล่นไว้แก้เหงา", correct: false }
      ],
      correctFeedback: "ใช่เลย! วิทยาศาสตร์บอกว่าน้ำคือสิ่งจำเป็นของพืช ข้อสรุปของเราจึงถูกต้องแน่นอน"
    },
    5: {
      title: "📢 ขั้นที่ 5: สื่อสารข้อมูล (Communicate)",
      instruction: "ช่วยน้องไดโนเขียนป้ายเตือนแปะกระถางกะเพราเพื่อบอกเพื่อนๆ ในห้องเรียนให้ถูกต้องหน่อยครับ!",
      options: [
        { text: "เขียนป้าย: 'ระวัง! ต้นไม้นี้มีพิษ ห้ามจับเด็ดขาด'", correct: false },
        { text: "เขียนป้าย: 'รดน้ำต้นกะเพราทุกเช้า-เย็น วันละนิด และวางในที่สว่างนะ'", correct: true }
      ],
      correctFeedback: "วิเศษมาก! การบอกข้อมูลวิธีดูแลที่ถูกต้องเป็นการสื่อสารที่เป็นประโยชน์ให้คนอื่นรับรู้"
    }
  };

  function renderStep() {
    const stepData = stepContents[currentStep];
    let actionHTML = '';

    if (stepData.tool === "magnifier") {
      actionHTML = `
        <div class="inquiry-lab-interactive">
          <div class="pot-display dry-plant" id="plant-pot">
            <span class="emoji-plant">🥀</span>
            <div class="soil-dry-label">ดินแห้งแตกระแหง</div>
          </div>
          <button class="btn-pastel-purple btn-action-game" id="btn-inspect">🔍 ใช้แว่นขยายตรวจสอบพืช</button>
        </div>
      `;
    } else {
      actionHTML = `
        <div class="inquiry-options-grid">
          ${stepData.options.map((opt, idx) => `
            <button class="btn-pastel-yellow btn-option-inquiry" data-idx="${idx}">
              ${opt.text}
            </button>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="game-container inquiry-game">
        <div class="inquiry-header">
          <h3>🕵️‍♂️ กิจกรรมสวมบทบาท: นักสืบพืชตัวน้อย</h3>
          <div class="step-progress-indicator">ขั้นตอนที่ ${currentStep} จาก ${totalSteps}</div>
        </div>

        <div class="game-workspace">
          <div class="instruction-box-game">
            <h4>${stepData.title}</h4>
            <p>${stepData.instruction}</p>
          </div>
          
          <div class="inquiry-action-area">
            ${actionHTML}
          </div>
        </div>

        <div class="game-feedback" id="inquiry-feedback-msg" style="display:none;"></div>
        <div class="game-navigation" style="display:none;" id="nav-area-inquiry">
          <button class="btn-pastel-green" id="btn-next-inquiry">ขั้นตอนต่อไป ➡️</button>
        </div>
      </div>
    `;

    // ผูก Event Listeners
    if (stepData.tool === "magnifier") {
      const inspectBtn = container.querySelector('#btn-inspect');
      inspectBtn.addEventListener('click', function() {
        const feedback = container.querySelector('#inquiry-feedback-msg');
        feedback.innerHTML = `🔬 <b>ผลการตรวจสอบ:</b> ${stepData.correctFeedback}`;
        feedback.style.display = 'block';
        feedback.style.color = 'var(--text-color)';
        
        const pot = container.querySelector('#plant-pot');
        pot.classList.add('inspecting');
        
        container.querySelector('#nav-area-inquiry').style.display = 'flex';
        inspectBtn.disabled = true;
        inspectBtn.style.opacity = '0.5';
      });
    } else {
      const optionButtons = container.querySelectorAll('.btn-option-inquiry');
      optionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.dataset.idx);
          const option = stepData.options[idx];
          const feedback = container.querySelector('#inquiry-feedback-msg');
          
          if (option.correct) {
            // เลือกคำตอบถูก
            feedback.innerHTML = `✅ <b>เก่งมาก!</b> ${stepData.correctFeedback}`;
            feedback.className = 'game-feedback correct-feedback';
            feedback.style.display = 'block';
            
            // ปิดการคลิกปุ่มตัวเลือกอื่น
            optionButtons.forEach(b => {
              b.disabled = true;
              b.style.opacity = '0.5';
            });
            this.style.opacity = '1';
            this.classList.add('btn-correct-selected');

            container.querySelector('#nav-area-inquiry').style.display = 'flex';
          } else {
            // เลือกผิด
            feedback.innerHTML = `❌ <b>ยังไม่ถูกต้องครับ</b> ลองอ่านทบทวนรายละเอียดและสืบเสาะหาคำตอบดูอีกทีนะ!`;
            feedback.className = 'game-feedback wrong-feedback';
            feedback.style.display = 'block';
            this.classList.add('shake-anim');
            setTimeout(() => this.classList.remove('shake-anim'), 500);
          }
        });
      });
    }

    // ปุ่มสลับขั้นตอนถัดไป
    const nextBtn = container.querySelector('#btn-next-inquiry');
    nextBtn.addEventListener('click', function() {
      if (currentStep < totalSteps) {
        currentStep++;
        renderStep();
      } else {
        // สำเร็จการสืบเสาะ
        showSuccessScreen();
      }
    });
  }

  function showSuccessScreen() {
    container.innerHTML = `
      <div class="game-container inquiry-game success-screen-game">
        <span class="emoji-big">🌱✨</span>
        <h3>🎉 ยินดีด้วยครับนักสืบน้อย!</h3>
        <p>คุณรดน้ำต้นกะเพราและพาไปเจอแดดเรียบร้อยแล้ว ต้นกะเพราฟื้นกลับมาสดใสแข็งแรง มีใบเขียวชอุ่มเหมือนเดิมแล้วจ้า!</p>
        <p class="success-note">คุณผ่านทักษะการสืบเสาะหาความรู้ทางวิทยาศาสตร์แล้ว!</p>
        <div class="game-feedback correct-feedback" style="display:block;">
          รับดาวสะสมของบทเรียนที่ 1 เรียบร้อย! ⭐️
        </div>
      </div>
    `;
    launchConfetti(container);
    if (onComplete) onComplete();
  }

  renderStep();
}

// ----------------------------------------------------
// 3. ห้องทดลองดูดซับน้ำ (Water Absorption Lab) - บทที่ 2.1
// ----------------------------------------------------
export function initWaterAbsorptionGame(container, onComplete) {
  const materials = [
    { id: "sponge", name: "🧽 ฟองน้ำ", absorbs: true, desc: "ดูดซับน้ำได้ดีเยี่ยม! น้ำทั้งหมดถูกดูดเข้าไปข้างในดินอย่างรวดเร็ว", class: "mat-sponge" },
    { id: "cloth", name: "🧣 ผ้าฝ้าย", absorbs: true, desc: "ดูดซับน้ำได้ดี! น้ำซึมเปียกผ้าจนเป็นรอยชื้น", class: "mat-cloth" },
    { id: "plastic", name: "🛍️ แผ่นพลาสติก", absorbs: false, desc: "ไม่ดูดซับน้ำเลย! หยดน้ำกลิ้งไปกลิ้งมาอยู่บนผิวหน้าและไหลออกหมด", class: "mat-plastic" },
    { id: "spoon", name: "🥄 ช้อนโลหะ", absorbs: false, desc: "ไม่ดูดซับน้ำเลย! โลหะทึบไม่มีรูพรุน น้ำไม่สามารถซึมเข้าไปได้", class: "mat-spoon" }
  ];

  let selectedMaterial = null;
  const testedCount = new Set();

  function renderLab() {
    container.innerHTML = `
      <div class="game-container water-lab-game">
        <div class="game-instruction">
          <h3>💧 การทดลองสมบัติการดูดซับน้ำเสมือนจริง</h3>
          <p>เลือกวัสดุจากชั้นวางด้านล่าง จากนั้นคลิก <b>"บีบหลอดหยดน้ำ 💧"</b> เพื่อสังเกตผลการดูดซับน้ำของวัสดุนั้นๆ</p>
        </div>

        <div class="lab-workspace">
          <!-- โต๊ะทดลอง -->
          <div class="lab-table">
            <!-- ขาตั้งหลอดทดลอง/หลอดหยด -->
            <div class="dropper-apparatus">
              <div class="dropper" id="dropper-tool">💧</div>
            </div>
            
            <!-- ถาดวางวัสดุเพื่อรับน้ำ -->
            <div class="material-stage" id="stage-area">
              <div class="empty-stage-text">กรุณาเลือกวัสดุเพื่อวางบนถาด</div>
            </div>
          </div>

          <!-- ชั้นวางวัสดุ -->
          <div class="lab-shelf">
            <h4>📦 เลือกวัสดุที่จะทดลอง:</h4>
            <div class="shelf-materials">
              ${materials.map(mat => `
                <button class="btn-pastel-yellow btn-shelf-item" data-id="${mat.id}">
                  ${mat.name}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="lab-status-panel">
          <button class="btn-pastel-purple btn-action-game" id="btn-drop-water" disabled>💧 บีบหลอดหยดน้ำ</button>
          <div class="lab-output-message" id="lab-message">เลือกวัสดุวางบนแท่นทดลองได้เลยครับ</div>
        </div>

        <div class="tested-progress">
          ทดลองไปแล้ว: <span id="tested-number">0</span> / 4 ชนิด
        </div>
      </div>
    `;

    // ผูก Event ปุ่มกดเลือกวัสดุ
    container.querySelectorAll('.btn-shelf-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.dataset.id;
        selectedMaterial = materials.find(m => m.id === id);
        
        // อัปเดต UI ปุ่มบนชั้นวาง
        container.querySelectorAll('.btn-shelf-item').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');

        // เอาไปวางบน Stage
        const stage = container.querySelector('#stage-area');
        stage.innerHTML = `
          <div class="active-material-block ${selectedMaterial.class}" id="active-mat">
            <span class="mat-label">${selectedMaterial.name}</span>
            <div class="water-droplets-on-mat" id="water-effect-area"></div>
          </div>
        `;

        // เปิดให้กดบีบน้ำได้
        const dropBtn = container.querySelector('#btn-drop-water');
        dropBtn.disabled = false;
        
        container.querySelector('#lab-message').textContent = `พร้อมแล้ว! กดที่ปุ่มบีบหลอดหยดน้ำด้านล่างเพื่อหยดน้ำใส่ ${selectedMaterial.name}`;
      });
    });

    // ปุ่มทดสอบหยดน้ำ
    const dropBtn = container.querySelector('#btn-drop-water');
    dropBtn.addEventListener('click', function() {
      if (!selectedMaterial) return;

      const dropper = container.querySelector('#dropper-tool');
      const effectArea = container.querySelector('#water-effect-area');
      const feedback = container.querySelector('#lab-message');
      
      // ล้างเอฟเฟกต์เก่า
      effectArea.innerHTML = '';
      dropper.classList.add('squeezing');
      dropBtn.disabled = true;

      // แอนิเมชันน้ำหยดร่วงหล่น
      setTimeout(() => {
        dropper.classList.remove('squeezing');
        
        if (selectedMaterial.absorbs) {
          // ดูดซับ
          effectArea.innerHTML = `
            <div class="water-spot absorb-anim">💧</div>
          `;
          setTimeout(() => {
            feedback.innerHTML = `✅ <b>${selectedMaterial.name}</b>: ${selectedMaterial.desc}`;
            feedback.style.color = 'var(--success-color-dark)';
            
            // บันทึกความก้าวหน้า
            testedCount.add(selectedMaterial.id);
            updateProgress();
          }, 800);
        } else {
          // ไม่ดูดซับ
          effectArea.innerHTML = `
            <div class="water-roll roll-anim">💧</div>
          `;
          setTimeout(() => {
            feedback.innerHTML = `❌ <b>${selectedMaterial.name}</b>: ${selectedMaterial.desc}`;
            feedback.style.color = 'var(--text-color)';
            
            // บันทึกความก้าวหน้า
            testedCount.add(selectedMaterial.id);
            updateProgress();
          }, 800);
        }
      }, 500);
    });
  }

  function updateProgress() {
    const progressEl = container.querySelector('#tested-number');
    progressEl.textContent = testedCount.size;
    
    // เปิดให้คลิกหลอดหยดน้ำอีกครั้งหลังแสดงผลสำเร็จ
    const dropBtn = container.querySelector('#btn-drop-water');
    if (dropBtn) dropBtn.disabled = false;

    if (testedCount.size === 4) {
      setTimeout(() => {
        container.querySelector('#lab-message').innerHTML = `
          🎉 <b>ยอดเยี่ยมมาก!</b> คุณได้ทำการทดลองครบถ้วนทั้ง 4 ชิ้นแล้ว!<br>
          ทำให้สรุปได้ว่า <b>ฟองน้ำและผ้าขนหนูดูดซับน้ำได้</b> ส่วน <b>พลาสติกและช้อนโลหะไม่ดูดซับน้ำ</b> ครับ!
        `;
        launchConfetti(container);
        if (onComplete) onComplete();
      }, 1500);
    }
  }

  renderLab();
}

// ----------------------------------------------------
// 4. เครื่องผสมวัสดุ (Material Mixer Game) - บทที่ 2.2
// ----------------------------------------------------
export function initMaterialMixerGame(container, onComplete) {
  const ingredients = [
    { id: "cement", name: "🧱 ปูนผง", icon: "🥣" },
    { id: "sand", name: "🏜️ ทราย", icon: "⏳" },
    { id: "stone", name: "🪨 หิน", icon: "🪨" },
    { id: "water", name: "💧 น้ำ", icon: "💧" },
    { id: "flour", name: "🌾 แป้งสาลี", icon: "🍚" },
    { id: "color", name: "🎨 สีผสมอาหาร", icon: "🎨" },
    { id: "paper", name: "📰 กระดาษหนังสือพิมพ์", icon: "📰" },
    { id: "glue", name: "🧪 กาวลาเท็กซ์", icon: "🧴" }
  ];

  // สูตรผสมที่ถูกต้อง
  const recipes = [
    {
      name: "🧱 คอนกรีตบล็อกสุดแข็งแกร่ง!",
      ingredients: ["cement", "sand", "stone", "water"],
      desc: "เกิดปฏิกิริยารวมตัวกัน เมื่อแห้งจะกลายเป็นก้อนหินเทียมที่มีความแข็งแรงมาก ทนทาน เหมาะทำตึกถนน",
      emoji: "🏢",
      bgClass: "mix-concrete"
    },
    {
      name: "🎨 แป้งโดว์นิ่มหลากสีสันทักษะเด่น!",
      ingredients: ["flour", "water", "color"],
      desc: "แป้งเปียกน้ำเกาะกันเป็นเนื้อเหนียวนุ่ม มีความยืดหยุ่นสูง ปั้นเป็นรูปทรงต่างๆ ได้อย่างสนุกสนาน",
      emoji: "🧸",
      bgClass: "mix-dough"
    },
    {
      name: "🎭 หน้ากากเปเปอร์มาเช่สุดสร้างสรรค์!",
      ingredients: ["paper", "glue"],
      desc: "กาวเชื่อมประสานเยื่อกระดาษเข้าด้วยกัน เมื่อแห้งสนิทจะคงรูป แข็งแรงและมีน้ำหนักที่เบามาก",
      emoji: "🎭",
      bgClass: "mix-papier"
    }
  ];

  let selectedIngredients = [];
  let discoveredRecipes = new Set();

  function renderMixer() {
    container.innerHTML = `
      <div class="game-container mixer-game">
        <div class="game-instruction">
          <h3>🥣 เครื่องผสมวัสดุมหัศจรรย์ (Material Mixer)</h3>
          <p>เลือกวัตถุดิบบนชั้นวางเพื่อใส่ลงในหม้อผสม จากนั้นกดปุ่ม <b>"ผสมวัสดุ ✨"</b> เพื่อทดลองสร้างวัสดุใหม่ตามสูตรดูครับ!</p>
        </div>

        <div class="mixer-workspace">
          <!-- ตู้เก็บวัตถุดิบด้านข้าง -->
          <div class="shelf-ingredients">
            <h4>วัตถุดิบบนชั้นวาง:</h4>
            <div class="ingredients-grid">
              ${ingredients.map(ing => `
                <button class="btn-pastel-yellow btn-ingredient-item" data-id="${ing.id}">
                  <span class="ing-icon">${ing.icon}</span>
                  <span class="ing-name">${ing.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- หม้อผสมตรงกลาง -->
          <div class="mixer-area">
            <div class="mixer-pot" id="mixer-pot-element">
              <div class="pot-rim"></div>
              <div class="pot-body">
                <span class="pot-emoji">🥣</span>
                <div class="pot-inside-items" id="pot-contents">
                  <!-- วัตถุดิบที่ใส่อยู่ด้านใน -->
                  <div class="no-items-label">ใส่ของที่จะผสมในหม้อเลย!</div>
                </div>
              </div>
            </div>
            
            <div class="mixer-controls">
              <button class="btn-pastel-purple btn-action-game" id="btn-mix-action" disabled>✨ ผสมวัสดุเลย! ✨</button>
              <button class="btn-pastel-red btn-action-game" id="btn-clear-pot">🗑️ เทหม้อผสมทิ้ง</button>
            </div>
          </div>
        </div>

        <div class="mixer-feedback-box" id="mixer-result-box">
          ยังไม่ได้ทำรายการผสม
        </div>

        <div class="mixer-recipes-book">
          <h4>📖 สูตรลับที่ค้นพบแล้ว: <span id="discovered-ratio">0</span> / 3 สูตร</h4>
          <div class="recipes-status-list" id="recipe-list-tracker">
            <div class="recipe-item-track locked" id="track-concrete">🧱 สูตรคอนกรีต (??? + ??? + ??? + ???)</div>
            <div class="recipe-item-track locked" id="track-dough">🎨 สูตรแป้งโดว์ปั้น (??? + ??? + ???)</div>
            <div class="recipe-item-track locked" id="track-papier">🎭 สูตรเปเปอร์มาเช่ (??? + ???)</div>
          </div>
        </div>
      </div>
    `;

    // ผูก Event คัดเลือกไอเทม
    container.querySelectorAll('.btn-ingredient-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.dataset.id;
        
        if (selectedIngredients.includes(id)) {
          // มีอยู่แล้ว ให้เอาออก
          selectedIngredients = selectedIngredients.filter(item => item !== id);
          this.classList.remove('selected-in-pot');
        } else {
          // เพิ่มเข้าไป
          if (selectedIngredients.length >= 4) {
            alert("หม้อผสมจุได้สูงสุด 4 ชนิดพร้อมกันนะครับเด็กๆ!");
            return;
          }
          selectedIngredients.push(id);
          this.classList.add('selected-in-pot');
        }

        updatePotUI();
      });
    });

    // ปุ่มเทหม้อทิ้ง
    container.querySelector('#btn-clear-pot').addEventListener('click', function() {
      selectedIngredients = [];
      container.querySelectorAll('.btn-ingredient-item').forEach(b => b.classList.remove('selected-in-pot'));
      updatePotUI();
      container.querySelector('#mixer-result-box').innerHTML = "ล้างหม้อเรียบร้อยแล้ว ใส่ของชิ้นใหม่ได้เลย!";
      container.querySelector('#mixer-result-box').style.color = 'var(--text-color)';
    });

    // ปุ่มกดผสม
    const mixBtn = container.querySelector('#btn-mix-action');
    mixBtn.addEventListener('click', function() {
      if (selectedIngredients.length < 2) return;

      const pot = container.querySelector('#mixer-pot-element');
      const resultBox = container.querySelector('#mixer-result-box');
      
      pot.classList.add('shaking-pot-anim');
      mixBtn.disabled = true;

      // ค้นหาเปรียบเทียบสูตรผสม
      // คัดเรียงอักษรเพื่อเช็กความเหมือน
      const currentMixSorted = [...selectedIngredients].sort().join(',');
      
      let matchedRecipe = null;
      for (const recipe of recipes) {
        const recipeSorted = [...recipe.ingredients].sort().join(',');
        if (currentMixSorted === recipeSorted) {
          matchedRecipe = recipe;
          break;
        }
      }

      setTimeout(() => {
        pot.classList.remove('shaking-pot-anim');
        
        if (matchedRecipe) {
          // ผสมสำเร็จ
          resultBox.innerHTML = `
            <div class="mix-success-card">
              <span class="mix-result-emoji">${matchedRecipe.emoji}</span>
              <div>
                <strong>ค้นพบสูตรใหม่: ${matchedRecipe.name}</strong><br>
                <span>${matchedRecipe.desc}</span>
              </div>
            </div>
          `;
          resultBox.style.color = 'var(--success-color-dark)';
          
          discoveredRecipes.add(matchedRecipe.name);
          updateRecipeBook();
          launchConfetti(container);
        } else {
          // ผสมล้มเหลว
          resultBox.innerHTML = `💥 <b>ผสมไม่สำเร็จ!</b> วัตถุดิบเหล่านี้ไม่ทำปฏิกิริยาหรือรวมตัวกันได้สมบัติใหม่ ลองเลือกวัตถุดิบอื่นหรือเคลียร์หม้อผสมแล้วเริ่มใหม่นะจ๊ะ`;
          resultBox.style.color = '#E63946';
          mixBtn.disabled = false;
        }
      }, 1200);
    });
  }

  function updatePotUI() {
    const potContents = container.querySelector('#pot-contents');
    const mixBtn = container.querySelector('#btn-mix-action');

    if (selectedIngredients.length === 0) {
      potContents.innerHTML = `<div class="no-items-label">ใส่ของที่จะผสมในหม้อเลย!</div>`;
      mixBtn.disabled = true;
    } else {
      potContents.innerHTML = selectedIngredients.map(id => {
        const item = ingredients.find(i => i.id === id);
        return `<span class="floating-pot-item" title="${item.name}">${item.icon}</span>`;
      }).join('');
      
      // ผสมได้เมื่อมีของ 2 ชิ้นขึ้นไป
      mixBtn.disabled = selectedIngredients.length < 2;
    }
  }

  function updateRecipeBook() {
    const ratio = container.querySelector('#discovered-ratio');
    ratio.textContent = discoveredRecipes.size;

    // อัปเดตรายการหนังสือสูตร
    discoveredRecipes.forEach(recipeName => {
      if (recipeName.includes("คอนกรีต")) {
        const concreteTrack = container.querySelector('#track-concrete');
        concreteTrack.className = "recipe-item-track unlocked";
        concreteTrack.innerHTML = "🧱 <b>สูตรคอนกรีต</b> (ปูน + ทราย + หิน + น้ำ) ➡️ คอนกรีตบล็อกสุดแกร่ง";
      }
      if (recipeName.includes("แป้งโดว์")) {
        const doughTrack = container.querySelector('#track-dough');
        doughTrack.className = "recipe-item-track unlocked";
        doughTrack.innerHTML = "🎨 <b>สูตรแป้งโดว์ปั้น</b> (แป้งสาลี + น้ำ + สีผสมอาหาร) ➡️ แป้งปั้นยืดหยุ่น";
      }
      if (recipeName.includes("เปเปอร์มาเช่")) {
        const papierTrack = container.querySelector('#track-papier');
        papierTrack.className = "recipe-item-track unlocked";
        papierTrack.innerHTML = "🎭 <b>สูตรเปเปอร์มาเช่</b> (หนังสือพิมพ์ + กาว) ➡️ หน้ากากแข็งน้ำหนักเบา";
      }
    });

    if (discoveredRecipes.size === 3) {
      setTimeout(() => {
        container.querySelector('#mixer-result-box').innerHTML = `
          🎉 <b>ยินดีด้วยครับนักผสมตัวน้อย!</b><br>
          คุณค้นพบสูตรการผสมวัสดุที่ยอดเยี่ยมได้ครบทั้งหมด 3 ชนิดแล้วจ้า! เก่งมากๆ!
        `;
        if (onComplete) onComplete();
      }, 2000);
    }
  }

  renderMixer();
}

// ----------------------------------------------------
// 5. เกมส์เลือกวัสดุสร้างสิ่งของ (Builder Game) - บทที่ 2.3
// ----------------------------------------------------
export function initBuilderGame(container, onComplete) {
  const quests = [
    {
      id: "umbrella",
      character: "👨‍🚒 พี่เจ้าหน้าที่ดับเพลิง",
      request: "อยากสร้าง <b>'เสื้อกันฝน/ร่มกันฝน'</b> เอาไว้เดินตรวจงานช่วงหน้าฝนไม่ให้ร่างกายเปียกครับ",
      correctMaterial: "plastic",
      correctText: "แผ่นพลาสติกกันน้ำ",
      options: [
        { id: "wood", name: "🪵 ไม้แผ่นหนา", desc: "หนักและดูดซับน้ำพองตัวได้ ไม่กันฝน" },
        { id: "plastic", name: "🛍️ แผ่นพลาสติกบาง", desc: "น้ำหนักเบา ไม่ดูดซับน้ำ กันน้ำรั่วซึมได้ดีเยี่ยม!", correct: true },
        { id: "paper", name: "📰 กระดาษหนังสือพิมพ์", desc: "เปียกยุ่ยฉีกขาดง่ายมากเมื่อเจอน้ำ" }
      ],
      successPic: "🧥"
    },
    {
      id: "hammer",
      character: "🔨 พี่ช่างไม้หัวใจแกร่ง",
      request: "ต้องการผลิต <b>'หัวค้อนตอกตะปู'</b> เพื่อใช้งานตอกไม้ซ่อมบ้านให้แข็งแรงทนทาน",
      correctMaterial: "metal",
      correctText: "เหล็ก/โลหะแข็ง",
      options: [
        { id: "metal", name: "🔩 เหล็กเหนียวแข็งแรง", desc: "มีความแข็งสูงมาก ทนทาน ไม่แตกหักง่ายเมื่อตอกกระแทก", correct: true },
        { id: "glass", name: "🥛 แผ่นกระจกใส", desc: "เปราะแตกหักง่ายเป็นอันตรายเมื่อกระแทกแรงๆ" },
        { id: "rubber", name: "🛞 ยางเหนียว", desc: "ยืดหยุ่นเกินไป ตอกตะปูไม่จมลงเนื้อไม้" }
      ],
      successPic: "🔨"
    },
    {
      id: "scarf",
      character: "⛄ น้องหมีขาวขั้วโลก",
      request: "ต้องการ <b>'เสื้อหนาว/ผ้าพันคอ'</b> เพื่อสวมใส่เดินทางท่องเที่ยวบนยอดเขาที่หนาวจัด",
      correctMaterial: "wool",
      correctText: "ผ้าขนสัตว์/ไหมพรม",
      options: [
        { id: "metal", name: "🔩 แผ่นแผ่นเหล็กบาง", desc: "เย็นเฉียบและนำความร้อนออกจากร่างกายเร็วขึ้น" },
        { id: "plastic", name: "🛍️ ถุงพลาสติก", desc: "กันน้ำได้แต่เก็บกักความอบอุ่นไม่ได้ดี" },
        { id: "wool", name: "🧶 ผ้าขนสัตว์/ไหมพรม", desc: "สัมผัสนุ่ม ยืดหยุ่นได้ กักเก็บความร้อนช่วยให้อบอุ่นร่างกายดีที่สุด!", correct: true }
      ],
      successPic: "🧣"
    }
  ];

  let currentQuestIdx = 0;

  function renderQuest() {
    const quest = quests[currentQuestIdx];

    container.innerHTML = `
      <div class="game-container builder-game">
        <div class="game-instruction">
          <h3>🛠️ กิจกรรม: วิศวกรน้อยช่วยสร้างสิ่งของ</h3>
          <p>ช่วยเลือกวัสดุที่เหมาะสมที่สุดในการสร้างสิ่งของตามคำขอของลูกค้ากันสิครับ!</p>
        </div>

        <div class="builder-workspace">
          <!-- กล่องผู้ขอความช่วยเหลือ -->
          <div class="customer-bubble">
            <span class="customer-avatar">👤</span>
            <div class="bubble-text">
              <strong>${quest.character} กล่าวว่า:</strong><br>
              "${quest.request}"
            </div>
          </div>

          <!-- ตัวเลือกวัสดุ -->
          <div class="materials-picker-list">
            <h4>เลือกชิ้นส่วนวัสดุมาสร้าง:</h4>
            <div class="builder-options-grid">
              ${quest.options.map((opt, idx) => `
                <button class="btn-pastel-yellow btn-builder-option" data-idx="${idx}">
                  <strong>${opt.name}</strong><br>
                  <span class="opt-desc-sm">${opt.desc}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="game-feedback" id="builder-feedback-msg" style="display:none;"></div>
        
        <div class="builder-navigation" id="builder-nav" style="display:none;">
          <button class="btn-pastel-green" id="btn-next-builder">ส่งมอบงานและเปลี่ยนลูกค้า ➡️</button>
        </div>
      </div>
    `;

    // ผูก Event การตัดสินใจเลือก
    const optionsBtn = container.querySelectorAll('.btn-builder-option');
    optionsBtn.forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.dataset.idx);
        const option = quest.options[idx];
        const feedback = container.querySelector('#builder-feedback-msg');

        if (option.correct) {
          // ตอบถูก
          feedback.innerHTML = `🎉 <b>ยอดเยี่ยมมาก!</b> คุณเลือกใช้ <b>${quest.correctText}</b> ในการทำสิ่งของชิ้นนี้ได้เหมาะสมตามความสมบัติของวัสดุสำเร็จแล้ว! ${quest.successPic}`;
          feedback.className = 'game-feedback correct-feedback';
          feedback.style.display = 'block';
          
          optionsBtn.forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.5';
          });
          this.style.opacity = '1';
          this.classList.add('btn-correct-selected');

          // แสดงนำทาง
          container.querySelector('#builder-nav').style.display = 'flex';
          launchConfetti(container);
        } else {
          // ตอบผิด
          feedback.innerHTML = `❌ <b>วัสดุชิ้นนี้ยังไม่เหมาะสมครับ</b> ลองพิจารณาเรื่องความเหนียว การกันน้ำ หรือความทนทานตามคำขอของลูกค้าดูใหม่นะ!`;
          feedback.className = 'game-feedback wrong-feedback';
          feedback.style.display = 'block';
          
          this.classList.add('shake-anim');
          setTimeout(() => this.classList.remove('shake-anim'), 500);
        }
      });
    });

    // ปุ่มสลับเควส
    container.querySelector('#btn-next-builder').addEventListener('click', function() {
      if (currentQuestIdx < quests.length - 1) {
        currentQuestIdx++;
        renderQuest();
      } else {
        showFinalBuilderScreen();
      }
    });
  }

  function showFinalBuilderScreen() {
    container.innerHTML = `
      <div class="game-container builder-game success-screen-game">
        <span class="emoji-big">🏆🛠️</span>
        <h3>🎉 สุดยอดวิศวกรน้อย!</h3>
        <p>คุณสามารถช่วยเหลือลูกค้าทุกท่านเลือกใช้วัสดุในการประดิษฐ์และก่อสร้างสิ่งของได้เสร็จสิ้นเป็นที่พึงพอใจทั้งหมด!</p>
        <p class="success-note">เด็กๆ ได้เรียนรู้วิธีการเลือกใช้วัสดุตามสมบัติเด่นของมันได้อย่างสมบูรณ์แบบแล้วครับ!</p>
        <div class="game-feedback correct-feedback" style="display:block;">
          คุณได้รับดาวดวงที่ 5 และผ่านการเรียนรู้หน่วยที่ 2 ครบถ้วนแล้ว! ⭐️⭐️⭐️⭐️⭐️
        </div>
      </div>
    `;
    launchConfetti(container);
    if (onComplete) onComplete();
  }

  renderQuest();
}
