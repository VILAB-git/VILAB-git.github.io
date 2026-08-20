// ../../js/news-detail.js
document.addEventListener('DOMContentLoaded', async function () {
  // === Simple image modal (for award images, etc.) ===
  let imageModal = null;
  let imageModalImg = null;

  function initImageModal() {
    if (imageModal) return;

    const modalHtml = `
      <div id="image-modal" class="image-modal" aria-hidden="true">
        <div class="image-modal-backdrop"></div>
        <div class="image-modal-body">
          <img class="image-modal-img" src="" alt="">
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    imageModal = document.getElementById('image-modal');
    imageModalImg = imageModal.querySelector('.image-modal-img');

    const close = () => {
      imageModal.classList.remove('open');
      document.body.style.overflow = '';
    };

    imageModal
      .querySelector('.image-modal-backdrop')
      .addEventListener('click', close);

    // 바깥(검은영역) 클릭 시 닫기
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) close();
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && imageModal.classList.contains('open')) {
        close();
      }
    });
  }

  function openImageModal(src, alt) {
    if (!imageModal) initImageModal();
    imageModalImg.src = src;
    imageModalImg.alt = alt || '';
    imageModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }


  const detailEl = document.getElementById('news-detail');
  if (!detailEl) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    detailEl.innerHTML = '<p>Invalid news id.</p>';
    return;
  }

  try {
    const item = await window.dataManager.getNewsItem(id);
    if (!item) {
      detailEl.innerHTML = '<p>News not found.</p>';
      return;
    }

    renderDetail(item);
  } catch (e) {
    console.error(e);
    detailEl.innerHTML = '<p>Error loading news.</p>';
  }

  function renderDetail(item) {
    switch (item.type) {
      case 'publication':
        renderPublicationNews(item);
        break;
      case 'admission':
        renderAdmissionNews(item);
        break;
      case 'graduation':
        renderGraduationNews(item);
        break;
      case 'award':
        renderAwardNews(item);
        break;
      case 'career':
        renderCareerNews(item);
        break;
      case 'service':
        renderServiceNews(item);
        break;
      case 'media':
        renderMediaNews(item);
        break;
      default:
        renderGenericNews(item);
    }
  }

  // ===== Publication-type news =====
  async function renderPublicationNews(item) {
    const container = document.getElementById('news-detail');
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const venueLabel = item.venue || '';
    const pubVenueRaw = item.pub_venue || item.venue || '';
    const pubYear =
      item.pub_year || item.year || new Date(item.date).getFullYear();

    // ✅ 헤더에서는 summary 출력하지 않음
    container.innerHTML = `
      <header class="news-detail-header">
        <h1 class="news-detail-title">${item.title}</h1>
        <div class="news-detail-meta">
          <span class="news-detail-date">${dateText}</span>
          <span class="news-detail-type news-type-publication">Publication</span>
        </div>
      </header>

      <section class="news-publications" id="news-publications">
        <p class="news-publications-subtitle">Loading related papers...</p>
      </section>
    `;

    // publications.json 로드
    let allPubs = [];
    try {
      allPubs = await window.dataManager.getPublications();
    } catch (err) {
      console.error('Failed to load publications:', err);
      const sec = document.getElementById('news-publications');
      if (sec) {
        sec.innerHTML = `
          <p class="news-publications-subtitle">
            Failed to load publication list.
          </p>
        `;
      }
      return;
    }

    // "CVPR 2025" → "CVPR"
    const venueKey = pubVenueRaw.replace(/[0-9]/g, '').trim();
    const yearNum = Number(pubYear);

    const matched = allPubs.filter((pub) => {
      const v = (pub.venue || '').trim();
      const y = Number(pub.year);
      const venueMatch = !venueKey ? true : v === venueKey || v.includes(venueKey);
      const yearMatch = Number.isNaN(yearNum) ? true : y === yearNum;
      const mainMatch = venueMatch && yearMatch;

      // 동시 accept / workshop 단독 논문: workshop 소속 학회로도 매칭
      const ws = pub.workshop;
      let workshopMatch = false;
      if (ws) {
        const wsVenue = ws.venue || '';
        const wsVenueMatch = !venueKey
          ? true
          : wsVenue === venueKey || wsVenue.includes(venueKey);
        const wsYearMatch = Number.isNaN(yearNum) ? true : Number(ws.year) === yearNum;
        workshopMatch = wsVenueMatch && wsYearMatch;
      }

      return mainMatch || workshopMatch;
    });

    const pubsSection = document.getElementById('news-publications');
    if (!pubsSection) return;

    if (!matched.length) {
      pubsSection.innerHTML = `
        <p class="news-publications-subtitle">
          No matching publications found in the publications list.
        </p>
      `;
      return;
    }

    // ✅ paper / workshop 개수 계산
    //  - workshop 논문: workshop 필드가 있거나 venue에 'workshop' 포함
    //  - workshop 단독: type === 'workshop' 또는 venue에 'workshop' 포함
    //    (구형: venue "CVPR Workshop" + type "conference", 신형: type "workshop")
    //  - 본 학회 논문(numMain): workshop 단독이 아닌 것 (동시 accept은 본지로 포함)
    const isWorkshopOnly = (pub) =>
      pub.type === 'workshop' || (pub.venue || '').toLowerCase().includes('workshop');
    const hasWorkshop = (pub) =>
      !!pub.workshop || (pub.venue || '').toLowerCase().includes('workshop');

    const numWorkshop = matched.filter(hasWorkshop).length;
    const numMain = matched.filter((pub) => !isWorkshopOnly(pub)).length;

    // 발표형태 카운트(본지 기준) + workshop oral(별도 집계)
    const mainPapers = matched.filter((pub) => !isWorkshopOnly(pub));
    const countPresentation = (label) =>
      mainPapers.filter(
        (p) => (p.presentation || '').trim().toLowerCase() === label
      ).length;
    const numOral = countPresentation('oral');
    const numSpotlight = countPresentation('spotlight');
    const numHighlight = countPresentation('highlight');
    const numWorkshopOral = matched.filter(
      (p) => hasWorkshop(p) &&
        ((p.workshop && (p.workshop.presentation || '').trim().toLowerCase() === 'oral') ||
         (p.presentation || '').trim().toLowerCase() === 'oral')
    ).length;

    const baseVenueLabel = venueLabel || `${venueKey} ${yearNum || ''}`;

    function buildSummarySentence() {
      const paperWord = (n) => `paper${n > 1 ? 's' : ''}`;
      const workshopWord = (n) => `workshop paper${n > 1 ? 's' : ''}`;

      // 1) 기본 문장 (본지 + workshop 편수)
      let base;
      if (numMain > 0 && numWorkshop > 0) {
        base = `${numMain} main ${paperWord(numMain)} and ${numWorkshop} ${workshopWord(numWorkshop)} from VILAB have been accepted to ${baseVenueLabel}`;
      } else if (numMain > 1) {
        base = `${numMain} ${paperWord(numMain)} from VILAB have been accepted to ${baseVenueLabel}`;
      } else if (numMain === 1) {
        base = `${numMain} ${paperWord(numMain)} from VILAB has been accepted to ${baseVenueLabel}`;
      } else if (numWorkshop > 1) {
        base = `${numWorkshop} ${workshopWord(numWorkshop)} from VILAB have been accepted to ${baseVenueLabel}`;
      } else {
        base = `${numWorkshop} ${workshopWord(numWorkshop)} from VILAB has been accepted to ${baseVenueLabel}`;
      }

      // 2) 본지 발표형태 목록 (oral / spotlight / highlight)
      const honor = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
      const mainHonors = [];
      if (numOral > 0) mainHonors.push(honor(numOral, 'oral presentation'));
      if (numSpotlight > 0) mainHonors.push(honor(numSpotlight, 'spotlight'));
      if (numHighlight > 0) mainHonors.push(honor(numHighlight, 'highlight'));

      const joinList = (arr) =>
        arr.length <= 1
          ? arr.join('')
          : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`;

      let honorSegment = '';
      const atMain = numWorkshop > 0 ? ' at the main conference' : '';
      if (mainHonors.length && numWorkshopOral > 0) {
        honorSegment = `, including ${joinList(mainHonors)}${atMain}, along with ${honor(numWorkshopOral, 'workshop oral presentation')}`;
      } else if (mainHonors.length) {
        honorSegment = `, including ${joinList(mainHonors)}${atMain}`;
      } else if (numWorkshopOral > 0) {
        honorSegment = `, including ${honor(numWorkshopOral, 'workshop oral presentation')}`;
      }

      return `${base}${honorSegment}.`;
    }

    const listHtml = matched.map(createNewsPublicationHTML).join('');

    // ✅ h2 "NeurIPS 2025" 같은 제목은 빼고, 한 줄 요약 + 리스트만
    pubsSection.innerHTML = `
      <p class="news-publications-subtitle">
        ${buildSummarySentence()}
      </p>
      <div class="news-publications-list">
        ${listHtml}
      </div>
    `;
  }

  function createNewsPublicationHTML(pub) {
    const presentation = pub.presentation
      ? ` ${pub.presentation.charAt(0).toUpperCase() + pub.presentation.slice(1)}`
      : '';

    // Workshop 정보 (동시 accept / workshop 단독)
    let workshopHtml = '';
    if (pub.workshop) {
      const ws = pub.workshop;
      const isWorkshopOnly = pub.type === 'workshop';
      const wsVenueYear = `${ws.venue || ''} ${ws.year || pub.year || ''} Workshop`.trim();
      const label = isWorkshopOnly ? 'Workshop' : 'Also at Workshop';
      const wsPresentation = ws.presentation
        ? ` <span class="presentation-tag"><strong>${ws.presentation}</strong></span>`
        : '';
      workshopHtml = `
        <p class="news-publication-workshop">
          <span class="workshop-tag">${label}</span>
          ${ws.name}${wsVenueYear ? ` &middot; ${wsVenueYear}` : ''}${wsPresentation}
        </p>
      `;
    }

    return `
      <article class="news-publication-item">
        <h3 class="news-publication-title">${pub.title}</h3>
        <p class="news-publication-authors">${pub.authors.join(', ')}</p>
        <p class="news-publication-venue">
          <strong>${pub.venue} ${pub.year}</strong>
          ${presentation ? `<span class="presentation-tag"><strong>${presentation}</strong></span>` : ''}
        </p>
        ${workshopHtml}
        ${
          pub.keywords
            ? `<div class="news-publication-keywords">
                 ${pub.keywords
                   .map((k) => `<span class="keyword">${k}</span>`)
                   .join('')}
               </div>`
            : ''
        }
        <div class="news-publication-links">
          ${
            pub.pdf_url && pub.pdf_url !== '#'
              ? `<a href="${pub.pdf_url}" class="pub-link" target="_blank" rel="noopener">Paper</a>`
              : ''
          }
          ${
            pub.supp_url && pub.supp_url !== '#'
              ? `<a href="${pub.supp_url}" class="pub-link" target="_blank" rel="noopener">Supp</a>`
              : ''
          }
          ${
            pub.arxiv_url && pub.arxiv_url !== '#'
              ? `<a href="${pub.arxiv_url}" class="pub-link" target="_blank" rel="noopener">ArXiv</a>`
              : ''
          }
          ${
            pub.code_url && pub.code_url !== '#'
              ? `<a href="${pub.code_url}" class="pub-link" target="_blank" rel="noopener">Code</a>`
              : ''
          }
          ${
            pub.project_url && pub.project_url !== '#'
              ? `<a href="${pub.project_url}" class="pub-link" target="_blank" rel="noopener">Project Page</a>`
              : ''
          }
        </div>
      </article>
    `;
  }


  function renderPersonCard(p) {
    return `
      <div class="person-card news-person-card">
        <div class="person-photo-wrap">
          <img src="${p.image}" alt="${p.name}" class="person-photo">
        </div>
        <div class="person-info">
          <h3 class="person-name">${p.name}</h3>
          <p class="person-major">${p.degree ? `${p.degree}, ` : ''}${p.major || ''}</p>
          ${p.email ? `<p class="person-email"><a href="mailto:${p.email}">${p.email}</a></p>` : ''}
          ${p.next_position ? `<p class="person-next"><strong>Next position:</strong> ${p.next_position}</p>` : ''}
          ${p.note ? `<p class="person-note">${p.note}</p>` : ''}
        </div>
      </div>
    `;
  }

  async function renderAdmissionNews(item) {
    const container = document.getElementById('news-detail');
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const description = item.description || '';

    // ✅ 새로운 형식: item.people = { phd: [...], ms: [...] }
    const peopleGroups = item.people || {};

    // people.json 전체 로드 후 name → person 인덱스
    const allPeople = await window.dataManager.getPeople();
    const indexByName = {};
    allPeople.forEach((p) => {
      if (p.name) indexByName[p.name.trim()] = p;
    });

    const order = ['phd', 'ms']; // PhD 먼저
    const labelMap = {
      phd: 'PhD Students',
      ms: 'Masters Students',
    };

    const studentPlaceholder = '../../assets/images/people/student-placeholder.svg';

    function createAdmissionCard(name, groupKey) {
      const person = indexByName[name.trim()];

      if (!person) {
        return `
          <div class="person-card admission-person-card">
            <div class="person-info">
              <h3 class="person-name">${name}</h3>
            </div>
          </div>
        `;
      }

      const imgFile = person.image || '';
      const imgPath = imgFile
        ? `../../assets/images/people/${imgFile}`
        : studentPlaceholder;

      // groupKey에 따라 전공 선택
      let major = '';
      if (groupKey === 'phd') {
        major =
          person.major_phd ||
          person.major ||
          person.major_ms ||
          '';
      } else if (groupKey === 'ms') {
        major =
          person.major_ms ||
          person.major ||
          person.major_phd ||
          '';
      } else {
        major = person.major || person.major_ms || person.major_phd || '';
      }

      const email = person.email || '';
      const website = person.website || '';

      return `
        <div class="person-card admission-person-card">
          <div class="person-photo">
            <img
              src="${imgPath}"
              alt="${person.name}"
              class="photo"
              style="width: 150px; height: 150px; object-fit: cover;"
              onerror="this.src='${studentPlaceholder}'"
            >
          </div>
          <div class="person-info">
            <h3 class="person-name">${person.name}</h3>
            ${major ? `<p class="person-major">${major}</p>` : ''}
            ${
              email
                ? `<p class="person-email"><a href="mailto:${email}">${email}</a></p>`
                : ''
            }
            ${
              website
                ? `<div class="person-links">
                     <a href="${website}" target="_blank" class="person-link">Website</a>
                   </div>`
                : ''
            }
          </div>
        </div>
      `;
    }

    function renderGroup(groupKey) {
      const names = peopleGroups[groupKey];
      if (!Array.isArray(names) || !names.length) return '';

      const cardsHtml = names
        .map((n) => createAdmissionCard(n, groupKey))
        .join('');

      return `
        <div class="people-category">
          <h2 class="admission-group-title">${labelMap[groupKey] || groupKey}</h2>
          <div class="people-grid">
            ${cardsHtml}
          </div>
        </div>
      `;
    }

    // 최종 HTML: 헤더 → description → PhD → MS
    container.innerHTML = `
      <header class="news-detail-header">
        <h1 class="news-detail-title">${item.title}</h1>
        <div class="news-detail-meta">
          <span class="news-detail-date">${dateText}</span>
          <span class="news-detail-type news-type-admission">Admission</span>
        </div>
      </header>

      ${
        description
          ? `<p class="admission-description">${description}</p>`
          : ''
      }

      ${renderGroup('phd')}
      ${renderGroup('ms')}
    `;
  }

  async function renderGraduationNews(item) {
    const container = document.getElementById('news-detail');
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const description = item.description || '';

    // ✅ 새로운 형식: item.people = { phd: [...], ms: [...] }
    const peopleGroups = item.people || {};

    // 우선 헤더 + 골격 먼저
    container.innerHTML = `
      <header class="news-detail-header">
        <h1 class="news-detail-title">${item.title}</h1>
        <div class="news-detail-meta">
          <span class="news-detail-date">${dateText}</span>
          <span class="news-detail-type news-type-graduation">Graduation</span>
        </div>
      </header>

      ${description ? `<p class="graduation-description">${description}</p>` : ''}

      <section class="graduation-people-section" id="graduation-people-section">
        <p class="graduation-people-subtitle">Loading graduated members...</p>
      </section>
    `;

    const sectionEl = document.getElementById('graduation-people-section');
    if (!sectionEl) return;

    // people.json 전체 로드 후 name → person 인덱스 생성
    let allPeople = [];
    try {
      allPeople = await window.dataManager.getPeople(); // peoples 전체
    } catch (err) {
      console.error('Failed to load people data:', err);
      sectionEl.innerHTML = `
        <p class="graduation-people-subtitle">
          Failed to load people information.
        </p>
      `;
      return;
    }

    const indexByName = {};
    allPeople.forEach((p) => {
      if (!p.name) return;
      indexByName[p.name.trim()] = p;
    });

    const order = ['phd', 'ms']; // PhD 먼저
    const labelMap = {
      phd: 'PhD Graduates',
      ms: 'Masters Graduates',
    };

    const studentPlaceholder = '../../assets/images/people/student-placeholder.svg';

    function createGradCard(name, groupKey) {
      const person = indexByName[name.trim()];

      if (!person) {
        // people.json에 없으면 이름만 표시
        return `
          <div class="person-card graduation-person-card">
            <div class="person-info">
              <h3 class="person-name">${name}</h3>
            </div>
          </div>
        `;
      }

      const imgFile = person.image || '';
      const imgPath = imgFile
        ? `../../assets/images/people/${imgFile}`
        : studentPlaceholder;

      // ----- 전공 선택 (groupKey 기준) -----
      let major = '';
      if (groupKey === 'phd') {
        major =
          person.major_phd ||
          person.major ||          // 예전 필드 호환
          person.major_ms ||
          '';
      } else if (groupKey === 'ms') {
        major =
          person.major_ms ||
          person.major ||          // 예전 필드 호환
          person.major_phd ||
          '';
      } else {
        major = person.major || person.major_ms || person.major_phd || '';
      }

      // ----- 논문 제목 선택 (groupKey 기준) -----
      let thesisEn = '';
      let thesisKo = '';

      if (groupKey === 'phd') {
        thesisEn = person.thesis_phd || '';
        thesisKo = person.thesis_phd_kor || '';
      } else if (groupKey === 'ms') {
        thesisEn = person.thesis_ms || '';
        thesisKo = person.thesis_ms_kor || '';
      } else {
        // 혹시 모를 예외용 fallback
        thesisEn =
          person.thesis_ms ||
          person.thesis_phd ||
          '';
        thesisKo =
          person.thesis_ms_kor ||
          person.thesis_phd_kor ||
          '';
      }

      const email = person.email || '';
      const website = person.website || '';

      // // 논문 블록은 하나라도 있으면 표시
      // const thesisBlock =
      //   thesisEn || thesisKo
      //     ? `
      //   <div class="person-thesis-block">
      //     <p class="person-thesis-label"><strong>Thesis</strong></p>
      //     ${
      //       thesisEn
      //         ? `<p class="person-thesis-en">${thesisEn}</p>`
      //         : ''
      //     }
      //     ${
      //       thesisKo
      //         ? `<p class="person-thesis-ko">${thesisKo}</p>`
      //         : ''
      //     }
      //   </div>
      // `
      //     : '';
      
      // 논문 블록은 영문만 표시
      const thesisBlock =
        thesisEn
          ? `
        <div class="person-thesis-block">
          <p class="person-thesis-label"><strong>Thesis</strong></p>
          ${`<p class="person-thesis-en">${thesisEn}</p>`}
        </div>
        `
          : '';

      return `
        <div class="person-card graduation-person-card">
          <div class="person-photo">
            <img
              src="${imgPath}"
              alt="${person.name}"
              class="photo"
              style="width: 150px; height: 150px; object-fit: cover;"
              onerror="this.src='${studentPlaceholder}'"
            >
          </div>
          <div class="person-info">
            <h3 class="person-name">${person.name}</h3>
            ${major ? `<p class="person-major">${major}</p>` : ''}
            ${thesisBlock}
            ${
              email
                ? `<p class="person-email"><a href="mailto:${email}">${email}</a></p>`
                : ''
            }
            ${
              website
                ? `<div class="person-links">
                     <a href="${website}" target="_blank" class="person-link">Website</a>
                   </div>`
                : ''
            }
          </div>
        </div>
      `;
    }

    let html = '';

    order.forEach((groupKey, idx) => {
      const names = peopleGroups[groupKey];
      if (!Array.isArray(names) || !names.length) return;

      const cardsHtml = names.map((n) => createGradCard(n, groupKey)).join('');

      html += `
        ${idx > 0 ? '<hr class="graduation-divider" />' : ''}
        <div class="people-category">
          <h2 class="category-title">${labelMap[groupKey] || groupKey}</h2>
          <div class="people-grid">
            ${cardsHtml}
          </div>
        </div>
      `;
    });

    if (!html) {
      sectionEl.innerHTML = `
        <p class="graduation-people-subtitle">
          No graduated members are listed.
        </p>
      `;
    } else {
      sectionEl.innerHTML = html;
    }
  }

  // ===== Award-type news =====
  function renderAwardNews(item) {
    const container = document.getElementById('news-detail');
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const awardName = item.award_name || item.title;
    const venue = item.venue || '';
    const description = item.description || '';

    // images: 배열 + 단일 image 모두 지원
    const images = Array.isArray(item.images)
      ? item.images
      : (item.image
          ? [{ src: item.image, alt: awardName }]
          : []);

    const links = Array.isArray(item.links) ? item.links : [];

    const imagesHtml = images.length
      ? `
      <section class="award-images-grid">
        ${images
          .map(
            (img) => `
          <button type="button"
                  class="award-image-card"
                  data-full-src="${img.src}"
                  data-alt="${img.alt || awardName}">
            <img src="${img.src}"
                 alt="${img.alt || awardName}"
                 class="award-thumb">
          </button>
        `
          )
          .join('')}
      </section>
    `
      : '';

    const linksHtml = links.length
      ? `
      <div class="award-links">
        ${links
          .map(
            (lnk) => `
          <a href="${lnk.url}"
             target="_blank"
             rel="noopener"
             class="award-link-chip">
            ${lnk.label}
          </a>
        `
          )
          .join('')}
      </div>
    `
      : '';

    container.innerHTML = `
      <header class="news-detail-header">
        <h1 class="news-detail-title">${awardName}</h1>
        <div class="news-detail-meta">
          <span class="news-detail-date">${dateText}</span>
          <span class="news-detail-type news-type-award">Award</span>
        </div>
      </header>

      ${
        description
          ? `<section class="award-description">
               ${description}
             </section>`
          : ''
      }

      ${imagesHtml}
      ${linksHtml}
    `;

    // 썸네일 클릭 시 모달 열기
    const thumbButtons = container.querySelectorAll('.award-image-card');
    if (thumbButtons.length) {
      initImageModal();
      thumbButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const fullSrc = btn.dataset.fullSrc;
          const alt = btn.dataset.alt || awardName;
          openImageModal(fullSrc, alt);
        });
      });
    }
  }

  // Career-type news
  async function renderCareerNews(item) {
    const container = document.getElementById('news-detail');
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const description = item.description || item.summary || '';

    const peopleEntries = Array.isArray(item.people) ? item.people : [];

    // people.json 로드해서 name → person 매핑
    let allPeople = [];
    try {
      allPeople = await window.dataManager.getPeople();
    } catch (err) {
      console.error('Failed to load people data for career:', err);
    }
    const indexByName = {};
    allPeople.forEach((p) => {
      if (p.name) indexByName[p.name.trim()] = p;
    });

    function getDegreeMajorLine(person) {
      if (!person) return '';

      let degree = '';
      let major = '';

      if (person.category === 'phd') {
        degree = 'Ph.D in';
        major = person.major_phd || person.major || person.major_ms || '';
      } else if (person.category === 'ms') {
        degree = 'M.S. in';
        major = person.major_ms || person.major || person.major_phd || '';
      } else {
        // 그 외는 그냥 major만
        major = person.major || person.major_ms || person.major_phd || '';
      }

      if (!major) return '';
      if (!degree) return `<p class="person-major">${major}</p>`;

      return `<p class="person-major">${degree} ${major}</p>`;
    }

    function createCareerCard(entry) {
      const name = entry.name || '';
      const person = indexByName[name.trim()];

      // 위쪽: people 카드 요약 (사진, 이름, 학위+전공, 이메일, 개인 홈페이지)
      const placeholderImg = '../../assets/images/people/student-placeholder.svg';
      const imgFile = person && person.image ? person.image : '';
      const imgPath = imgFile
        ? `../../assets/images/people/${imgFile}`
        : placeholderImg;

      const email = person && person.email ? person.email : '';
      const personalWebsite = person && person.website ? person.website : '';

      const degreeMajorHtml = getDegreeMajorLine(person);

      const personCardTop = `
        <div class="person-card career-person-card">
          <div class="person-photo">
            <img
              src="${imgPath}"
              alt="${name}"
              class="photo"
              style="width: 150px; height: 150px; object-fit: cover;"
              onerror="this.src='${placeholderImg}'"
            >
          </div>
          <div class="person-info">
            <h3 class="person-name">${name}</h3>
            ${degreeMajorHtml}
            ${
              email
                ? `<p class="person-email"><a href="mailto:${email}">${email}</a></p>`
                : ''
            }
            ${
              personalWebsite
                ? `<div class="person-links">
                     <a href="${personalWebsite}" target="_blank" class="person-link">Website</a>
                   </div>`
                : ''
            }
          </div>
        </div>
      `;

      // 아래쪽: Appointed as ... + Related Article
      const careerEn = entry.career || '';
      const careerKo = entry.career_ko || '';
      const articleTitle = entry.article_title || '';
      const articleUrl = entry.article_url || '';

      const careerBlock =
        careerEn || careerKo
          ? `
        <div class="career-next-block">
          ${
            careerEn
              ? `<p class="career-next-enline">
                   <strong>Appointed as&nbsp;</strong>
                   <span>${careerEn}</span>
                 </p>`
              : ''
          }
          ${careerKo ? `<p class="career-next-ko">${careerKo}</p>` : ''}
        </div>
      `
          : '';

      const articleBlock =
        articleTitle && articleUrl
          ? `
        <p class="career-article">
          <span class="career-article-label">Related Article:</span>
          <a href="${articleUrl}" target="_blank" rel="noopener">
            ${articleTitle}
          </a>
        </p>
      `
          : '';

      // 전체 카드 래핑 (위쪽 people 카드 + 아래 커리어 정보)
      return `
        <article class="career-person-wrapper">
          ${personCardTop}
          ${careerBlock}
          ${articleBlock}
        </article>
      `;
    }

    const cardsHtml = peopleEntries.map(createCareerCard).join('');

    container.innerHTML = `
      <header class="news-detail-header">
        <h1 class="news-detail-title">${item.title}</h1>
        <div class="news-detail-meta">
          <span class="news-detail-date">${dateText}</span>
          <span class="news-detail-type news-type-career">Career</span>
        </div>
      </header>

      ${
        description
          ? `<section class="career-description">
               ${description}
             </section>`
          : ''
      }

      ${
        cardsHtml
          ? `<section class="career-people-section">
               ${cardsHtml}
             </section>`
          : ''
      }
    `;
  }

  // Service-type news
  function renderServiceNews(item) {
    const container = document.getElementById('news-detail');
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const serviceName = item.service_name || item.title;
    const venue = item.venue || '';
    const description = item.description || '';

    // images: 배열 + 단일 image 모두 지원
    const images = Array.isArray(item.images)
      ? item.images
      : (item.image
          ? [{ src: item.image, alt: serviceName }]
          : []);

    const links = Array.isArray(item.links) ? item.links : [];

    const imagesHtml = images.length
      ? `
      <section class="service-images-grid">
        ${images
          .map(
            (img) => `
          <button type="button"
                  class="service-image-card"
                  data-full-src="${img.src}"
                  data-alt="${img.alt || serviceName}">
            <img src="${img.src}"
                 alt="${img.alt || serviceName}"
                 class="service-thumb">
          </button>
        `
          )
          .join('')}
      </section>
    `
      : '';

    const linksHtml = links.length
      ? `
      <div class="service-links">
        ${links
          .map(
            (lnk) => `
          <a href="${lnk.url}"
             target="_blank"
             rel="noopener"
             class="service-link-chip">
            ${lnk.label}
          </a>
        `
          )
          .join('')}
      </div>
    `
      : '';

    container.innerHTML = `
      <header class="news-detail-header">
        <h1 class="news-detail-title">${serviceName}</h1>
        <div class="news-detail-meta">
          <span class="news-detail-date">${dateText}</span>
          <span class="news-detail-type news-type-service">Service</span>
        </div>
      </header>

      ${
        description
          ? `<section class="service-description">
               ${description}
             </section>`
          : ''
      }

      ${imagesHtml}
      ${linksHtml}
    `;

    // 썸네일 클릭 시 모달 열기
    const thumbButtons = container.querySelectorAll('.service-image-card');
    if (thumbButtons.length) {
      initImageModal();
      thumbButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const fullSrc = btn.dataset.fullSrc;
          const alt = btn.dataset.alt || serviceName;
          openImageModal(fullSrc, alt);
        });
      });
    }
  }

  // media-type news
  function renderMediaNews(item) {
    const container = document.getElementById('news-detail');
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const mediaName = item.media_name || item.title;
    const venue = item.venue || '';
    const description = item.description || '';

    // images: 배열 + 단일 image 모두 지원
    const images = Array.isArray(item.images)
      ? item.images
      : (item.image
          ? [{ src: item.image, alt: mediaName }]
          : []);

    const links = Array.isArray(item.links) ? item.links : [];

    const imagesHtml = images.length
      ? `
      <section class="media-images-grid">
        ${images
          .map(
            (img) => `
          <button type="button"
                  class="media-image-card"
                  data-full-src="${img.src}"
                  data-alt="${img.alt || mediaName}">
            <img src="${img.src}"
                 alt="${img.alt || mediaName}"
                 class="media-thumb">
          </button>
        `
          )
          .join('')}
      </section>
    `
      : '';

    const linksHtml = links.length
      ? `
      <div class="media-links">
        ${links
          .map(
            (lnk) => `
          <a href="${lnk.url}"
             target="_blank"
             rel="noopener"
             class="media-link-chip">
            ${lnk.label}
          </a>
        `
          )
          .join('')}
      </div>
    `
      : '';

    container.innerHTML = `
      <header class="news-detail-header">
        <h1 class="news-detail-title">${mediaName}</h1>
        <div class="news-detail-meta">
          <span class="news-detail-date">${dateText}</span>
          <span class="news-detail-type news-type-media">Media</span>
        </div>
      </header>

      ${
        description
          ? `<section class="media-description">
               ${description}
             </section>`
          : ''
      }

      ${imagesHtml}
      ${linksHtml}
    `;

    // 썸네일 클릭 시 모달 열기
    const thumbButtons = container.querySelectorAll('.media-image-card');
    if (thumbButtons.length) {
      initImageModal();
      thumbButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const fullSrc = btn.dataset.fullSrc;
          const alt = btn.dataset.alt || mediaName;
          openImageModal(fullSrc, alt);
        });
      });
    }
  }


  function renderGenericNews(item) {
    const container = document.getElementById('news-detail');
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const summary = item.summary || item.description || '';

    container.innerHTML = `
      <header class="news-detail-header">
        <h1 class="news-detail-title">${item.title}</h1>
        <div class="news-detail-meta">
          <span class="news-detail-date">${dateText}</span>
        </div>
        ${
          summary
            ? `<p class="news-detail-summary">${summary}</p>`
            : ''
        }
      </header>
    `;
  }
});
