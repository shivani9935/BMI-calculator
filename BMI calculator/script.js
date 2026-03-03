let unit = 'metric';
  const STORAGE_KEY = 'bmi_history';

  function setUnit(u) {
    unit = u;
    document.getElementById('btnMetric').classList.toggle('active', u === 'metric');
    document.getElementById('btnImperial').classList.toggle('active', u === 'imperial');
    document.getElementById('metricFields').style.display = u === 'metric' ? 'grid' : 'none';
    document.getElementById('imperialFields').style.display = u === 'imperial' ? 'grid' : 'none';
    document.getElementById('lbsField').style.display = u === 'imperial' ? 'block' : 'none';
  }

  function getCategoryInfo(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' };
    if (bmi < 25)   return { label: 'Normal Weight', color: '#34d399' };
    if (bmi < 30)   return { label: 'Overweight', color: '#fbbf24' };
    return             { label: 'Obese', color: '#f87171' };
  }

  function bmiToBarPercent(bmi) {
    // Map BMI 10–40 to 0–100%
    return Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
  }

  function validate() {
    let valid = true;
    if (unit === 'metric') {
      const h = parseFloat(document.getElementById('heightCm').value);
      const w = parseFloat(document.getElementById('weightKg').value);
      const errH = document.getElementById('errHeight');
      const errW = document.getElementById('errWeight');
      const inH = document.getElementById('heightCm');
      const inW = document.getElementById('weightKg');
      if (!h || h <= 0) {
        errH.style.display = 'block'; inH.classList.add('error'); valid = false;
      } else { errH.style.display = 'none'; inH.classList.remove('error'); }
      if (!w || w <= 0) {
        errW.style.display = 'block'; inW.classList.add('error'); valid = false;
      } else { errW.style.display = 'none'; inW.classList.remove('error'); }
    } else {
      const ft = parseFloat(document.getElementById('heightFt').value) || 0;
      const inches = parseFloat(document.getElementById('heightIn').value) || 0;
      const lbs = parseFloat(document.getElementById('weightLbs').value);
      const errW = document.getElementById('errWeightLbs');
      const inW = document.getElementById('weightLbs');
      if (!lbs || lbs <= 0) {
        errW.style.display = 'block'; inW.classList.add('error'); valid = false;
      } else { errW.style.display = 'none'; inW.classList.remove('error'); }
      if ((ft + inches) <= 0) { valid = false; }
    }
    return valid;
  }

  function calculate() {
    if (!validate()) return;

    let bmi;
    if (unit === 'metric') {
      const h = parseFloat(document.getElementById('heightCm').value) / 100;
      const w = parseFloat(document.getElementById('weightKg').value);
      bmi = w / (h * h);
    } else {
      const ft = parseFloat(document.getElementById('heightFt').value) || 0;
      const inches = parseFloat(document.getElementById('heightIn').value) || 0;
      const totalInches = ft * 12 + inches;
      const lbs = parseFloat(document.getElementById('weightLbs').value);
      bmi = (lbs / (totalInches * totalInches)) * 703;
    }

    bmi = parseFloat(bmi.toFixed(2));
    const { label, color } = getCategoryInfo(bmi);
    const name = document.getElementById('nameInput').value.trim();

    // Show result
    const rc = document.getElementById('resultCard');
    rc.classList.add('show');
    rc.style.setProperty('--result-color', color);

    document.getElementById('resultName').textContent = name ? `Results for ${name}` : 'Your BMI Result';
    document.getElementById('bmiValue').textContent = bmi;
    document.getElementById('bmiCategory').textContent = label;
    document.getElementById('bmiBar').style.width = bmiToBarPercent(bmi) + '%';
    document.getElementById('bmiBar').style.background = color;

    // Save to localStorage
    const history = getHistory();
    history.unshift({
      name: name || 'Anonymous',
      bmi,
      category: label,
      color,
      time: new Date().toLocaleString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
    renderHistory();
  }

  function resetAll() {
    ['heightCm','weightKg','heightFt','heightIn','weightLbs','nameInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ''; el.classList.remove('error'); }
    });
    ['errHeight','errWeight','errWeightLbs'].forEach(id => {
      document.getElementById(id).style.display = 'none';
    });
    document.getElementById('resultCard').classList.remove('show');
    document.getElementById('bmiBar').style.width = '0%';
  }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function renderHistory() {
    const history = getHistory();
    const hc = document.getElementById('historyCard');
    if (history.length === 0) { hc.classList.remove('show'); return; }
    hc.classList.add('show');
    const list = document.getElementById('historyList');
    list.innerHTML = history.map(h => `
      <li class="history-item" style="--item-color:${h.color}">
        <div>
          <div class="hi-name">${h.name}</div>
          <div class="hi-meta">${h.category} · ${h.time}</div>
        </div>
        <div class="hi-bmi">${h.bmi}</div>
      </li>
    `).join('');
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  }

  // Init
  renderHistory();