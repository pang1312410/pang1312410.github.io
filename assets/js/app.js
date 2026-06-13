import { learningContent } from './content.js';
import * as games from './games.js';

// ----------------------------------------------------
// สถานะแอปพลิเคชัน (Application State)
// ----------------------------------------------------
const state = {
  userName: localStorage.getItem('science_land_name') || 'นักวิทยาศาสตร์น้อย',
  // เก็บบันทึกบทเรียนที่ทำสำเร็จแล้ว (เช่น { u1_ch1: true })
  completed: JSON.parse(localStorage.getItem('science_land_completed')) || {},
  // เก็บคะแนนสอบของแต่ละบทเรียน (เช่น { u1_ch1: 3 })
  scores: JSON.parse(localStorage.getItem('science_land_scores')) || {}
};

// บันทึกสถานะลงใน LocalStorage
function saveState() {
  localStorage.setItem('science_land_name', state.userName);
  localStorage.setItem('science_land_completed', JSON.stringify(state.completed));
  localStorage.setItem('science_land_scores', JSON.stringify(state.scores));
}

// ----------------------------------------------------
// ระบบ Router (ควบคุมการสลับหน้าระหว่างแอปหน้าเดียว)
// ----------------------------------------------------
const root = document.getElementById('app-content-root');

export function navigateTo(view, params = {}) {
  // ยกเลิกสถานะ Active ของแท็บอื่นๆ ใน navbar
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  
  if (view === 'home') {
    document.getElementById('nav-home').classList.add('active');
    renderHome();
  } else if (view === 'awards') {
    document.getElementById('nav-awards').classList.add('active');
    renderAwards();
  } else if (view === 'chapter') {
    renderChapter(params.chapterId, params.activeTab || 'learn');
  }
  
  // เลื่อนกลับไปด้านบนสุดเมื่อเปลี่ยนหน้า
  window.scrollTo(0, 0);
}

// ----------------------------------------------------
// หน้าแรก (Home View)
// ----------------------------------------------------
function renderHome() {
  // คำนวณความคืบหน้าของนักเรียน
  const totalChapters = 5;
  const completedCount = Object.keys(state.completed).filter(key => state.completed[key]).length;

  root.innerHTML = `
    <!-- แบนเนอร์หน้าแรกต้อนรับ -->
    <div class="welcome-banner">
      <img class="mascot-mascot-landing" src="assets/images/mascot_dino.png" alt="Mascot Dino" id="dino-mascot-home">
      <div class="welcome-text">
        <h2>ยินดีต้อนรับสู่ Science Land! 🌟</h2>
        <p>สวัสดีจ้า! หนูชื่อ <b>น้องไดโน</b> จะพาทุกคนไปผจญภัยในโลกวิทยาศาสตร์สุดสนุกของพวกเรานะ!</p>
        <p style="font-size: 1.15rem; margin-top: 10px; color: var(--text-muted);">
          🏆 เรียนรู้และทำมินิเกมสะสมดาวครบ 5 บทเรียนเพื่อรับใบประกาศนียบัตรกันนะ (สำเร็จแล้ว: ${completedCount}/${totalChapters} บท)
        </p>
      </div>
    </div>

    <!-- รายชื่อหน่วยการเรียนรู้ -->
    <div class="unit-list">
      
      <!-- หน่วยที่ 1 -->
      <div class="unit-card" id="card-u1">
        <div class="unit-card-header" style="background-color: var(--primary-color-light);">
          <h3>🔍 ${learningContent.unit1.title}</h3>
          <p>${learningContent.unit1.description}</p>
        </div>
        <div class="chapters-grid">
          ${learningContent.unit1.chapters.map(ch => renderChapterCardHTML(ch)).join('')}
        </div>
      </div>

      <!-- หน่วยที่ 2 -->
      <div class="unit-card" id="card-u2">
        <div class="unit-card-header" style="background-color: var(--success-color-light);">
          <h3>🧪 ${learningContent.unit2.title}</h3>
          <p>${learningContent.unit2.description}</p>
        </div>
        <div class="chapters-grid">
          ${learningContent.unit2.chapters.map(ch => renderChapterCardHTML(ch)).join('')}
        </div>
      </div>

    </div>
  `;

  // เชื่อม Event คลิกบนการ์ดบทเรียน
  containerBindChapterClicks();
}

function renderChapterCardHTML(ch) {
  const isDone = state.completed[ch.id];
  const score = state.scores[ch.id];
  
  return `
    <div class="chapter-box" data-id="${ch.id}">
      <div class="chapter-info">
        <div class="chapter-icon-circle" style="background-color: ${ch.color}40;">
          ${ch.icon}
        </div>
        <div class="chapter-details">
          <h4>${ch.title}</h4>
          <p>เข้าศึกษา เรียนรู้ และประเมินทักษะ</p>
          ${score !== undefined ? `<p style="color:var(--primary-color-dark); font-weight:700; margin-top:4px;">คะแนนประเมิน: ${score}/3</p>` : ''}
        </div>
      </div>
      
      ${isDone ? `<span class="badge-status" title="เรียนจบแล้ว!">⭐</span>` : ''}
      
      <button class="btn-pastel btn-pastel-yellow btn-enter-chapter" data-id="${ch.id}">
        เข้าผจญภัยกันเลย! ➡️
      </button>
    </div>
  `;
}

function containerBindChapterClicks() {
  root.querySelectorAll('.btn-enter-chapter, .chapter-box').forEach(el => {
    el.addEventListener('click', function(e) {
      // ป้องกันการทำงานซ้อนถ้าไปคลิกโดนปุ่มด้านในการ์ด
      e.stopPropagation();
      const chapterId = this.dataset.id;
      navigateTo('chapter', { chapterId });
    });
  });
}

// ----------------------------------------------------
// หน้ารายละเอียดบทเรียน (Chapter & Tabs View)
// ----------------------------------------------------
function renderChapter(chapterId, activeTab) {
  // ค้นหาข้อมูลบทเรียนที่ตรงกัน
  let chapterData = null;
  let unitTitle = '';
  
  if (learningContent.unit1.chapters.find(c => c.id === chapterId)) {
    chapterData = learningContent.unit1.chapters.find(c => c.id === chapterId);
    unitTitle = learningContent.unit1.title;
  } else if (learningContent.unit2.chapters.find(c => c.id === chapterId)) {
    chapterData = learningContent.unit2.chapters.find(c => c.id === chapterId);
    unitTitle = learningContent.unit2.title;
  }

  if (!chapterData) {
    alert("ไม่พบบทเรียนที่ต้องการ!");
    navigateTo('home');
    return;
  }

  const isDone = state.completed[chapterId];

  root.innerHTML = `
    <!-- ลิงก์ย้อนกลับ -->
    <a href="#" class="back-to-home-link" id="btn-back-home">⬅️ กลับหน้าหลักของดินแดนเรียนรู้</a>

    <div class="lesson-page-container">
      
      <!-- หัวข้อบทเรียน -->
      <div class="lesson-header">
        <div class="lesson-title-area">
          <span style="font-size: 1rem; color: var(--text-muted); font-weight: 700;">${unitTitle}</span>
          <h2>${chapterData.icon} ${chapterData.title}</h2>
        </div>
        ${isDone ? `
          <div class="lesson-badge-unlocked">
            <span>⭐ ปลดล็อกดาวแล้ว</span>
          </div>
        ` : ''}
      </div>

      <!-- แท็บการเรียนรู้ (Tabs) -->
      <div class="tabs-navigation">
        <button class="tab-btn ${activeTab === 'learn' ? 'active' : ''}" data-tab="learn">📖 1. บทเรียนแสนสนุก</button>
        <button class="tab-btn ${activeTab === 'game' ? 'active' : ''}" data-tab="game">🎮 2. กิจกรรมวิชาการ</button>
        <button class="tab-btn ${activeTab === 'quiz' ? 'active' : ''}" data-tab="quiz">✍️ 3. แบบทดสอบหลังเรียน</button>
      </div>

      <!-- พื้นที่แสดงข้อมูลของแต่ละแท็บ -->
      <div class="tab-content-container" id="chapter-tab-viewport">
        <!-- โหลดเข้ามาตามหมวดหมู่แท็บ -->
      </div>

    </div>
  `;

  // ผูก Event ปุ่มกดต่างๆ
  document.getElementById('btn-back-home').addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo('home');
  });

  // ผูก Event สลับแท็บ
  root.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetTab = this.dataset.tab;
      renderChapter(chapterId, targetTab);
    });
  });

  // โหลดหน้าเนื้อหาของแท็บที่เลือก
  const viewport = document.getElementById('chapter-tab-viewport');
  if (activeTab === 'learn') {
    renderTabLearn(viewport, chapterData);
  } else if (activeTab === 'game') {
    renderTabGame(viewport, chapterData);
  } else if (activeTab === 'quiz') {
    renderTabQuiz(viewport, chapterData);
  }
}

// --- แท็บที่ 1: เรียนเนื้อหา ---
function renderTabLearn(container, chapter) {
  container.innerHTML = `
    <div class="lesson-content-panel">
      <!-- บอลลูนทักทายจากมาสคอต -->
      <div class="intro-bubble">
        <img class="intro-mascot-pic" src="assets/images/mascot_dino.png" alt="Mascot">
        <div class="intro-text-balloon">
          "${chapter.intro}"
        </div>
      </div>

      <!-- บล็อกรายละเอียดแต่ละทักษะ -->
      ${chapter.sections.map(sec => `
        <div class="lesson-section-card">
          <h3>${sec.title}</h3>
          <p>${sec.content.replace(/\n/g, '<br>')}</p>
        </div>
      `).join('')}

      <button class="btn-action-game btn-pastel-purple" id="btn-proceed-to-game">
        เรียนเนื้อหาเสร็จแล้ว ไปเล่นเกมจำลองกันเถอะ! 🎮
      </button>
    </div>
  `;

  // คลิกเพื่อไปแท็บเกม
  container.querySelector('#btn-proceed-to-game').addEventListener('click', () => {
    renderChapter(chapter.id, 'game');
  });
}

// --- แท็บที่ 2: เล่นมินิเกม ---
function renderTabGame(container, chapter) {
  // ตัวนำ Container มาเตรียมสร้าง Game
  const gameViewport = document.createElement('div');
  container.appendChild(gameViewport);

  const completeCallback = () => {
    // เมื่อเล่นเกมสำเร็จ ให้สร้างปุ่มไปทำข้อสอบต่อ
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-action-game btn-pastel-green';
    nextBtn.innerHTML = 'เก่งมากครับ! เล่นเกมผ่านแล้ว ไปทำแบบทดสอบกันต่อเลย! ✍️';
    nextBtn.style.marginTop = '20px';
    nextBtn.addEventListener('click', () => {
      renderChapter(chapter.id, 'quiz');
    });
    container.appendChild(nextBtn);
  };

  // เรียกฟังก์ชันมินิเกมจากภายนอกตามบทเรียน
  if (chapter.id === 'u1_ch1') {
    games.initClassificationGame(gameViewport, completeCallback);
  } else if (chapter.id === 'u1_ch2') {
    games.initInquiryGame(gameViewport, completeCallback);
  } else if (chapter.id === 'u2_ch1') {
    games.initWaterAbsorptionGame(gameViewport, completeCallback);
  } else if (chapter.id === 'u2_ch2') {
    games.initMaterialMixerGame(gameViewport, completeCallback);
  } else if (chapter.id === 'u2_ch3') {
    games.initBuilderGame(gameViewport, completeCallback);
  }
}

// --- แท็บที่ 3: แบบทดสอบวัดความรู้ ---
function renderTabQuiz(container, chapter) {
  let activeQuestionIdx = 0;
  let score = 0;
  const questions = chapter.quiz;

  function renderQuizQuestion() {
    const q = questions[activeQuestionIdx];
    
    container.innerHTML = `
      <div class="quiz-container-box">
        <div class="quiz-progress">ข้อที่ ${activeQuestionIdx + 1} / ${questions.length}</div>
        
        <div class="quiz-question-title">
          <strong>คำถาม:</strong> ${q.question}
        </div>

        <div class="quiz-options-list">
          ${q.options.map((opt, idx) => `
            <button class="btn-quiz-option" data-idx="${idx}">
              ${idx + 1}. ${opt}
            </button>
          `).join('')}
        </div>

        <div class="quiz-feedback-box" id="quiz-ans-feedback" style="display:none;"></div>
        
        <div class="quiz-nav-row" style="display:none;" id="quiz-nav-area">
          <button class="btn-pastel-purple" id="btn-next-quiz">คำถามข้อถัดไป ➡️</button>
        </div>
      </div>
    `;

    // ผูก Event คลิกตอบข้อสอบ
    const optionsBtn = container.querySelectorAll('.btn-quiz-option');
    optionsBtn.forEach(btn => {
      btn.addEventListener('click', function() {
        const selectedIdx = parseInt(this.dataset.idx);
        const feedback = container.querySelector('#quiz-ans-feedback');

        // ตรวจคำตอบ
        if (selectedIdx === q.answer) {
          // ตอบถูก
          score++;
          feedback.innerHTML = `🎉 <b>ตอบถูกจ้า!</b> ${q.explain}`;
          feedback.style.color = 'var(--success-color-dark)';
          this.classList.add('correct');
        } else {
          // ตอบผิด
          feedback.innerHTML = `❌ <b>ยังไม่ถูกต้องครับ!</b> เฉลยข้อที่ถูกต้องคือ: ${q.options[q.answer]}<br>${q.explain}`;
          feedback.style.color = '#E63946';
          this.classList.add('wrong');
          // ไฮไลท์ข้อที่ถูกต้อง
          optionsBtn[q.answer].classList.add('correct');
        }

        // ปิดปุ่มทั้งหมด
        optionsBtn.forEach(b => b.disabled = true);
        feedback.style.display = 'block';
        container.querySelector('#quiz-nav-area').style.display = 'flex';
      });
    });

    // ปุ่มข้อถัดไป
    container.querySelector('#btn-next-quiz').addEventListener('click', () => {
      if (activeQuestionIdx < questions.length - 1) {
        activeQuestionIdx++;
        renderQuizQuestion();
      } else {
        renderQuizResult();
      }
    });
  }

  function renderQuizResult() {
    const passed = score >= 2; // ผ่านเมื่อได้ 2 คะแนนขึ้นไป
    
    if (passed) {
      // ปลดล็อกดาวบทนี้สำเร็จ
      state.completed[chapter.id] = true;
    }
    // อัปเดตบันทึกคะแนนที่ดีที่สุด
    if (state.scores[chapter.id] === undefined || score > state.scores[chapter.id]) {
      state.scores[chapter.id] = score;
    }
    saveState();

    container.innerHTML = `
      <div class="quiz-summary-card">
        <h3>สรุปผลคะแนนการประเมิน</h3>
        <p>บทเรียน: ${chapter.title}</p>
        
        <div class="score-display-circle">
          <div class="score-num">${score}</div>
          <div class="score-total">เต็ม 3</div>
        </div>

        <div class="badge-reward-display">
          ${passed ? `
            <span class="badge-big-emoji">⭐️</span>
            <p style="color:var(--success-color-dark); font-weight:700;">ยินดีด้วยครับ! คุณสอบผ่านบทเรียนนี้และได้รับดาวสะสมแล้วจ้า!</p>
          ` : `
            <span class="badge-big-emoji" style="filter:grayscale(1); opacity:0.3;">⭐️</span>
            <p style="color:#E63946; font-weight:700;">ยังไม่ผ่านเกณฑ์การประเมิน (ต้องได้ 2 คะแนนขึ้นไป)</p>
            <p>ไม่เป็นไรนะ ลองทบทวนเนื้อหาและทำแบบทดสอบใหม่อีกครั้งครับคนเก่ง!</p>
          `}
        </div>

        <div style="display:flex; gap:15px; justify-content:center; margin-top:2rem;">
          <button class="btn-pastel btn-pastel-yellow" id="btn-quiz-retry">✍️ สอบแก้ตัวใหม่</button>
          <button class="btn-pastel btn-pastel-purple" id="btn-quiz-finish-home">🏠 กลับหน้าแรก</button>
        </div>
      </div>
    `;

    if (passed) {
      games.launchConfetti(container);
    }

    container.querySelector('#btn-quiz-retry').addEventListener('click', () => {
      renderTabQuiz(container, chapter);
    });

    container.querySelector('#btn-quiz-finish-home').addEventListener('click', () => {
      navigateTo('home');
    });
  }

  renderQuizQuestion();
}

// ----------------------------------------------------
// หน้าถ้วยรางวัล / ใบประกาศเกียรติบัตร (Awards View)
// ----------------------------------------------------
function renderAwards() {
  const totalChapters = 5;
  const completedCount = Object.keys(state.completed).filter(key => state.completed[key]).length;
  const allCompleted = completedCount === totalChapters;

  // รายละเอียดดาวของแต่ละบท
  const badgeMap = [
    { id: "u1_ch1", name: "ทักษะวิทย์ ป.2", icon: "🔬" },
    { id: "u1_ch2", name: "นักสืบหาความรู้", icon: "🕵️‍♂️" },
    { id: "u2_ch1", name: "ดูดซับน้ำเก่ง", icon: "🧽" },
    { id: "u2_ch2", name: "นักผสมวัสดุ", icon: "🥣" },
    { id: "u2_ch3", name: "วิศวกรน้อย", icon: "🛠️" }
  ];

  root.innerHTML = `
    <div class="badge-status-board">
      <h2>🏆 ตู้โชว์เข็มกลัดดาววิทยาศาสตร์</h2>
      <p>สะสมดาวจากการสอบผ่านแบบทดสอบในแต่ละบทเรียนให้ครบ 5 ดวงเพื่อปลดล็อกใบประกาศเกียรติบัตรวิทยาศาสตร์ ป.2 สุดเท่!</p>
      
      <!-- แผงแสดงดาวสะสม -->
      <div class="badges-row-flex">
        ${badgeMap.map(badge => {
          const earned = state.completed[badge.id];
          return `
            <div class="badge-holder-spot">
              <div class="badge-bubble ${earned ? 'earned' : 'locked'}">
                ${badge.icon}
              </div>
              <div class="badge-name-lbl">${badge.name}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- ส่วนจัดทำใบรับรองเกียรติบัตร -->
    <div id="certificate-output-container">
      ${allCompleted ? renderCertificateHTML() : renderCertLockedHTML(completedCount, totalChapters)}
    </div>
  `;

  // ผูก Event ถ้าปลดล็อกหมดแล้ว
  if (allCompleted) {
    bindCertFormEvents();
  }
}

function renderCertLockedHTML(completed, total) {
  return `
    <div class="cert-locked-message">
      <span style="font-size:3rem;">🔒</span>
      <h3>ใบเกียรติบัตรยังไม่ได้ปลดล็อก</h3>
      <p>เด็กๆ ต้องผ่านแบบทดสอบครบถ้วนทั้ง 5 บทก่อนนะครับ ตอนนี้ทำได้ <b>${completed} / ${total}</b> บทเรียนแล้ว</p>
      <p style="color:var(--primary-color-dark); font-weight:700;">มาสู้ต่อไป! เข้าเรียนบทเรียนอื่นๆ เพื่อปลดล็อกกันเถอะ!</p>
      <button class="btn-pastel btn-pastel-purple" style="margin-top:10px;" id="btn-back-learning-cert">ไปห้องเรียนกันเลย ➡️</button>
    </div>
  `;
}

function renderCertificateHTML() {
  return `
    <div class="diploma-settings-card" style="background-color:var(--text-white); border:2px solid var(--text-color); padding:1.5rem; border-radius:var(--radius-lg); margin-bottom:2rem; box-shadow:var(--card-shadow);">
      <h4>✍️ เขียนชื่อของคุณลงในใบเกียรติบัตร</h4>
      <p>ป้อนชื่อสกุลนักเรียนด้านล่าง เพื่อพิมพ์ชื่อแสดงผลบนใบประกาศเกียรติบัตรแบบเรียลไทม์ได้เลยครับ</p>
      
      <div style="display:flex; gap:10px; margin-top:10px;">
        <input type="text" id="input-cert-student-name" value="${state.userName}" style="flex:1; padding:0.75rem 1rem; border:2px solid var(--text-color); border-radius:var(--radius-md); font-family:'Itim', sans-serif; font-size:1.15rem;" maxlength="35">
        <button class="btn-pastel btn-pastel-purple" id="btn-print-cert-action">⎙ พิมพ์ภาพ / เซฟ PDF</button>
      </div>
    </div>

    <!-- ใบเกียรติบัตรจำลองแบบสวยงาม -->
    <div class="diploma-card-wrapper" id="print-area-diploma">
      <div class="diploma-header">เกียรติบัตรยอดนักวิทย์รุ่นเล็ก</div>
      <div class="diploma-body">
        <p>ใบประกาศเกียรติบัตรนี้มอบให้เพื่อแสดงว่า</p>
        <div class="student-name-field" id="cert-student-name-display">${state.userName}</div>
        <p>ได้ผ่านการเรียนรู้ กิจกรรมเชิงลึก และบททดสอบครบหลักสูตรพื้นฐาน<br>
        <strong>วิทยาศาสตร์และเทคโนโลยี ระดับชั้นประถมศึกษาปีที่ 2</strong><br>
        ในหัวข้อ "การเรียนรู้สิ่งรอบตัว" และ "สมบัติของวัสดุและการใช้ประโยชน์"</p>
        <p>ขอให้รักษาความมุ่งมั่น ตั้งใจเรียน และสนุกกับการค้นคว้าวิทยาศาสตร์ต่อไป!</p>
      </div>
      <div class="diploma-footer">
        <div class="diploma-stamp">🏆✨</div>
        <div>
          <div class="diploma-sign">ผอ. ดินแดนวิทยาศาสตร์</div>
          <div style="font-size: 0.8rem; color:var(--text-muted); margin-top: 3px;">Science Land Director</div>
        </div>
      </div>
    </div>
  `;
}

function bindCertFormEvents() {
  const inputEl = document.getElementById('input-cert-student-name');
  const displayEl = document.getElementById('cert-student-name-display');
  
  // อัปเดตชื่อเรียลไทม์
  inputEl.addEventListener('input', function() {
    const val = this.value.trim() || 'นักเรียนยอดนักวิทย์';
    displayEl.textContent = val;
    state.userName = val;
    saveState();
  });

  // สั่งพิมพ์
  document.getElementById('btn-print-cert-action').addEventListener('click', function() {
    window.print();
  });

  // กลับไปเรียนถ้าค้างหน้าล็อก
  const btnBack = document.getElementById('btn-back-learning-cert');
  if (btnBack) {
    btnBack.addEventListener('click', () => navigateTo('home'));
  }
}

// ----------------------------------------------------
// ฟังก์ชันเริ่มต้นระบบแอปพลิเคชัน (Initialization)
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // ผูกการนำทางแถบเมนูด้านบน
  document.getElementById('nav-home').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });

  document.getElementById('nav-awards').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('awards');
  });

  document.getElementById('brand-logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });

  // เริ่มต้นด้วยหน้าแรก (Home View)
  navigateTo('home');
});
