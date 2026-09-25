/**
 * Interaktiv Matematik Klaviatura (Virtual Math Keyboard)
 * Har qanday son, amal, belgi, ildiz, formula va erkin matnlarni kiritish imkoniyati
 */
const MathKeyboard = {
  activeFieldKey: null,
  activeInputElement: null,
  activeFieldOrder: [],

  init() {
    // 36a dan 45b gacha bo'lgan maydonlar ketma-ketligini tuzish
    this.activeFieldOrder = [];
    for (let q = 36; q <= 45; q++) {
      this.activeFieldOrder.push(`${q}a`);
      this.activeFieldOrder.push(`${q}b`);
    }
  },

  openFor(fieldKey) {
    this.activeFieldKey = fieldKey;
    const inputEl = document.getElementById(`input-${fieldKey}`) || document.getElementById(`adm-input-${fieldKey}`);
    this.activeInputElement = inputEl;

    const panel = document.getElementById('math-keyboard-panel');
    const targetName = document.getElementById('keyboard-target-name');
    const liveInput = document.getElementById('keyboard-live-input');

    if (targetName) targetName.textContent = fieldKey.toUpperCase();
    if (liveInput && inputEl) {
      liveInput.value = inputEl.value || '';
    }

    if (panel) {
      panel.classList.add('open');
    }

    // Input qutisini aktiv deb belgilash
    document.querySelectorAll('.savol-input-box').forEach(b => b.classList.remove('focused'));
    const boxEl = document.getElementById(`box-${fieldKey}`);
    if (boxEl) {
      boxEl.classList.add('focused');
      boxEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  },

  close() {
    const panel = document.getElementById('math-keyboard-panel');
    if (panel) panel.classList.remove('open');
    document.querySelectorAll('.savol-input-box').forEach(b => b.classList.remove('focused'));
    this.activeFieldKey = null;
    this.activeInputElement = null;
  },

  onLiveInput(val) {
    if (!this.activeFieldKey) return;
    if (this.activeInputElement) {
      this.activeInputElement.value = val;
    }
    
    if (typeof TestApp !== 'undefined' && TestApp.setOpenAnswer) {
      TestApp.setOpenAnswer(this.activeFieldKey, val);
    } else if (window.TestApp && window.TestApp.setOpenAnswer) {
      window.TestApp.setOpenAnswer(this.activeFieldKey, val);
    }

    if (typeof AdminApp !== 'undefined' && AdminApp.updateOpenAns) {
      AdminApp.updateOpenAns(this.activeFieldKey, val);
    } else if (window.AdminApp && window.AdminApp.updateOpenAns) {
      window.AdminApp.updateOpenAns(this.activeFieldKey, val);
    }

    const boxEl = document.getElementById(`box-${this.activeFieldKey}`);
    if (boxEl) {
      boxEl.classList.toggle('filled', (val || '').trim().length > 0);
    }
  },

  insert(val) {
    if (!this.activeFieldKey) return;
    
    const liveInput = document.getElementById('keyboard-live-input');
    const targetInput = this.activeInputElement || liveInput;
    if (!targetInput) return;

    const start = targetInput.selectionStart ?? targetInput.value.length;
    const end = targetInput.selectionEnd ?? targetInput.value.length;
    const text = targetInput.value || '';

    const newVal = text.substring(0, start) + val + text.substring(end);
    targetInput.value = newVal;
    if (liveInput && liveInput !== targetInput) liveInput.value = newVal;
    if (this.activeInputElement && this.activeInputElement !== targetInput) this.activeInputElement.value = newVal;

    const newPos = start + val.length;
    if (targetInput.setSelectionRange) {
      try { targetInput.setSelectionRange(newPos, newPos); } catch (e) {}
    }

    this.onInputChange();
  },

  insertPower(powerChar) {
    if (!this.activeFieldKey) return;
    const liveInput = document.getElementById('keyboard-live-input');
    const targetInput = this.activeInputElement || liveInput;
    if (!targetInput) return;

    const start = targetInput.selectionStart ?? targetInput.value.length;
    const text = targetInput.value || '';
    const charBefore = start > 0 ? text[start - 1] : '';

    // Agar kursordan oldingi belgi son, harf, qavs yoki π (pi) bo'lsa:
    // Faqat daraja ko'rsatkichining o'zini biriktir (masalan: π², π³, x², 5³, (a+b)²)
    if (/[a-zA-Z0-9\)\_π]/.test(charBefore)) {
      this.insert(powerChar);
    } else {
      // Agar oldinda hech narsa bo'lmasa, x ning darajasini qo'yadi:
      this.insert('x' + powerChar);
    }
  },

  insertPiPower(p) {
    // To'g'ridan-to'g'ri π², π³ yoki π qo'yish uchun yordamchi funksiya
    if (!this.activeFieldKey) return;
    if (p === 1) this.insert('π');
    else if (p === 2) this.insert('π²');
    else if (p === 3) this.insert('π³');
    else this.insert('π^');
  },

  insertCustomPower() {
    if (!this.activeFieldKey) return;
    const liveInput = document.getElementById('keyboard-live-input');
    const targetInput = this.activeInputElement || liveInput;
    if (!targetInput) return;

    const start = targetInput.selectionStart ?? targetInput.value.length;
    const text = targetInput.value || '';
    const charBefore = start > 0 ? text[start - 1] : '';

    if (/[a-zA-Z0-9\)\_π]/.test(charBefore)) {
      this.insert('^');
    } else {
      this.insert('x^');
    }
  },

  backspace() {
    if (!this.activeFieldKey) return;
    const liveInput = document.getElementById('keyboard-live-input');
    const targetInput = this.activeInputElement || liveInput;
    if (!targetInput) return;

    const start = targetInput.selectionStart ?? targetInput.value.length;
    const end = targetInput.selectionEnd ?? targetInput.value.length;
    const text = targetInput.value || '';

    let newVal = text;
    let newPos = start;

    if (start === end && start > 0) {
      newVal = text.substring(0, start - 1) + text.substring(end);
      newPos = start - 1;
    } else if (start !== end) {
      newVal = text.substring(0, start) + text.substring(end);
      newPos = start;
    }

    targetInput.value = newVal;
    if (liveInput && liveInput !== targetInput) liveInput.value = newVal;
    if (this.activeInputElement && this.activeInputElement !== targetInput) this.activeInputElement.value = newVal;

    if (targetInput.setSelectionRange) {
      try { targetInput.setSelectionRange(newPos, newPos); } catch (e) {}
    }

    this.onInputChange();
  },

  clear() {
    if (!this.activeFieldKey) return;
    if (this.activeInputElement) this.activeInputElement.value = '';
    const liveInput = document.getElementById('keyboard-live-input');
    if (liveInput) liveInput.value = '';
    this.onInputChange();
  },

  onInputChange() {
    if (!this.activeFieldKey) return;
    const liveInput = document.getElementById('keyboard-live-input');
    const val = (this.activeInputElement ? this.activeInputElement.value : '') || (liveInput ? liveInput.value : '');
    
    // Asosiy TestApp holatiga saqlash
    if (typeof TestApp !== 'undefined' && TestApp.setOpenAnswer) {
      TestApp.setOpenAnswer(this.activeFieldKey, val);
    } else if (window.TestApp && window.TestApp.setOpenAnswer) {
      window.TestApp.setOpenAnswer(this.activeFieldKey, val);
    }

    if (typeof AdminApp !== 'undefined' && AdminApp.updateOpenAns) {
      AdminApp.updateOpenAns(this.activeFieldKey, val);
    } else if (window.AdminApp && window.AdminApp.updateOpenAns) {
      window.AdminApp.updateOpenAns(this.activeFieldKey, val);
    }

    // Box indicator
    const boxEl = document.getElementById(`box-${this.activeFieldKey}`);
    if (boxEl) {
      boxEl.classList.toggle('filled', (val || '').trim().length > 0);
    }

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  },

  prevField() {
    if (!this.activeFieldKey) return;
    const idx = this.activeFieldOrder.indexOf(this.activeFieldKey);
    if (idx > 0) {
      this.openFor(this.activeFieldOrder[idx - 1]);
    }
  },

  nextField() {
    if (!this.activeFieldKey) return;
    const idx = this.activeFieldOrder.indexOf(this.activeFieldKey);
    if (idx < this.activeFieldOrder.length - 1) {
      this.openFor(this.activeFieldOrder[idx + 1]);
    }
  },

  switchTab(tab) {
    const tabs = ['math', 'power', 'func', 'vars'];
    tabs.forEach(t => {
      const btn = document.getElementById(`kb-tab-${t}`);
      const body = document.getElementById(`keyboard-body-${t}`);
      if (btn) btn.classList.toggle('active', t === tab);
      if (body) body.style.display = t === tab ? 'flex' : 'none';
    });
  }
};

window.MathKeyboard = MathKeyboard;

document.addEventListener('DOMContentLoaded', () => {
  MathKeyboard.init();
});
