// People page functionality
class PeoplePage {
  constructor() {
    this.currentMembers = [];
    this.alumni = [];
    this.init();
  }

  async init() {
    try {
      await this.loadPeople();
      this.renderCurrentMembers();
      this.renderAlumni();
    } catch (error) {
      console.error('Error initializing people page:', error);
      this.showError('Failed to load people data');
    }
  }

  async loadPeople() {
    this.currentMembers = await window.dataManager.getCurrentMembers();
    this.alumni = await window.dataManager.getAlumni();
  }

  async renderCurrentMembers() {
    const container = document.getElementById('current-members-container');
    if (!container) return;

    if (this.currentMembers.length === 0) {
      container.innerHTML = '<div class="no-results">No current members found.</div>';
      return;
    }

    // Group current members by category
    const groupedMembers = this.groupPeopleByCategory(this.currentMembers);
    const categories = await window.dataManager.getPeopleCategories();

    let html = '';
    Object.entries(groupedMembers).forEach(([category, categoryMembers]) => {
      html += `
        <div class="people-category">
          <h2 class="category-title">${categories[category] || category}</h2>
          <div class="people-grid">
            ${categoryMembers.map(person => this.createCurrentMemberCard(person)).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  async renderAlumni() {
    const container = document.getElementById('alumni-container');
    if (!container) return;

    if (this.alumni.length === 0) {
      container.innerHTML = '<div class="no-results">No alumni found.</div>';
      return;
    }

    // Split alumni into Ph.D. and M.S. graduates (dual-degree people appear in
    // both). `this.alumni` is already sorted by graduation date (newest first).
    const isMS = person =>
      person.category === 'ms' || person.title === 'Masters';
    const phdAlumni = this.alumni.filter(person => !isMS(person));
    const msAlumni = this.alumni.filter(isMS);

    const section = (title, list) =>
      list.length === 0
        ? ''
        : `
      <div class="people-category">
        <h2 class="category-title">${title} <span class="alumni-count">(${list.length})</span></h2>
        <div class="people-grid">
          ${list.map(person => this.createAlumniCard(person)).join('')}
        </div>
      </div>
    `;

    container.innerHTML =
      section('Ph.D. Graduates', phdAlumni) +
      section('M.S. Graduates', msAlumni);
  }

  groupPeopleByCategory(people) {
    return people.reduce((groups, person) => {
      const category = person.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(person);
      return groups;
    }, {});
  }

  createCurrentMemberCard(person) {
    const imagePath = person.image
      ? `../../assets/images/people/${person.image}`
      : this.getPlaceholderImage(person.category);

    // 🔹 category에 따라 major 선택
    let majorText = '';
    if (person.category === 'phd' && person.major_phd) {
      majorText = person.major_phd;
    } else if (person.category === 'ms' && person.major_ms) {
      majorText = person.major_ms;
    } else if (person.category === 'intern') {
      // Intern: school + major (줄바꿈)
      const school = person.school ? person.school : '';
      const major = person.major ? person.major : '';

      if (school && major) {
        majorText = `${school}<br>${major}`;
      } else if (school) {
        majorText = school;
      } else if (major) {
        majorText = major;
      }
    } else if (person.major) {
      // 백워드 컴패티빌리티용 (예전 데이터가 남아 있을 수도 있으니)
      majorText = person.major;
    }

    const links = [];
    
    // Personal Page (globe)
    if (person.personalpage) {
      links.push(`
        <a href="${person.personalpage}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="Homepage">
          <i class="fa-solid fa-house"></i>
        </a>
      `);
    }

    // CV (pdf 링크)
    if (person.cv) {
      links.push(`
        <a href="${person.cv}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="CV">
          <i class="ai ai-cv"></i>
        </a>
      `);
    }

    // Google Scholar (Academicons)
    if (person.googlescholar) {   // people.json 키 그대로 사용
      links.push(`
        <a href="${person.googlescholar}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="Google Scholar">
          <i class="ai ai-google-scholar"></i>
        </a>
      `);
    }

    // LinkedIn
    if (person.linkedin) {
      links.push(`
        <a href="${person.linkedin}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="LinkedIn">
          <i class="fa-brands fa-linkedin-in"></i>
        </a>
      `);
    }

    // ORCID (Academicons)
    if (person.orcid) {
      // 전체 URL이 아니라 ID만 넣었다면 앞에 https://orcid.org/ 를 붙여줘도 됨
      const orcidUrl = person.orcid.startsWith('http')
        ? person.orcid
        : `https://orcid.org/${person.orcid}`;

      links.push(`
        <a href="${orcidUrl}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="ORCID">
          <i class="ai ai-orcid"></i>
        </a>
      `);
    }

    // GitHub
    if (person.github) {
      links.push(`
        <a href="${person.github}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="GitHub">
          <i class="fa-brands fa-github"></i>
        </a>
      `);
    }

    return `
      <div class="person-card">
        <div class="person-photo">
          <img src="${imagePath}" alt="${person.name}" class="photo" style="width: 150px; height: 150px; object-fit: cover;"
              onerror="this.src='${this.getPlaceholderImage(person.category)}'">
        </div>
        <div class="person-info">
          <h3 class="person-name">${person.name}</h3>
          ${majorText ? `<p class="person-major">${majorText}</p>` : ''}
          ${person.program ? `<p class="program-info">${person.program}</p>` : ''}
          ${person.email ? `<p class="person-email">${person.email}</p>` : ''}
          ${person.affiliation ? `<p class="person-affiliation">${person.affiliation}</p>` : ''}
          ${person.researchInterests ? `
            <p class="research-interests" style="font-weight: normal;">
              <span style="font-weight: bold;">Research Interests:</span> ${person.researchInterests.join(', ')}
            </p>
          ` : ''}
          ${person.role ? `<p class="role" style="font-weight: normal;">${person.role}</p>` : ''}
          ${links.length > 0 ? `<div class="person-links">${links.join('')}</div>` : ''}
        </div>
      </div>
    `;
  }

  createAlumniCard(person) {
    const graduationYear = person.graduationDate
      ? new Date(person.graduationDate).getFullYear()
      : '';

    // Fall back to category when an explicit title is missing.
    const primaryDegree = person.title
      || (person.category === 'phd' ? 'Ph.D'
        : person.category === 'ms' ? 'Masters' : '');

    const links = [];

    // Personal Page (globe)
    if (person.personalpage) {
      links.push(`
        <a href="${person.personalpage}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="Homepage">
          <i class="fa-solid fa-house"></i>
        </a>
      `);
    }

    // CV (pdf 링크)
    if (person.cv) {
      links.push(`
        <a href="${person.cv}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="CV">
          <i class="ai ai-cv"></i>
        </a>
      `);
    }

    // Google Scholar (Academicons)
    if (person.googlescholar) {   // people.json 키 그대로 사용
      links.push(`
        <a href="${person.googlescholar}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="Google Scholar">
          <i class="ai ai-google-scholar"></i>
        </a>
      `);
    }

    // LinkedIn
    if (person.linkedin) {
      links.push(`
        <a href="${person.linkedin}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="LinkedIn">
          <i class="fa-brands fa-linkedin-in"></i>
        </a>
      `);
    }

    // ORCID (Academicons)
    if (person.orcid) {
      // 전체 URL이 아니라 ID만 넣었다면 앞에 https://orcid.org/ 를 붙여줘도 됨
      const orcidUrl = person.orcid.startsWith('http')
        ? person.orcid
        : `https://orcid.org/${person.orcid}`;

      links.push(`
        <a href="${orcidUrl}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="ORCID">
          <i class="ai ai-orcid"></i>
        </a>
      `);
    }

    // GitHub
    if (person.github) {
      links.push(`
        <a href="${person.github}" target="_blank" rel="noopener"
          class="icon-btn" aria-label="GitHub">
          <i class="fa-brands fa-github"></i>
        </a>
      `);
    }

    return `
      <div class="person-card alumni-card">
        <div class="person-info">
          <h3 class="person-name">${person.name}</h3>
          <p class="person-title">${primaryDegree}</p>
          ${person.program ? `<p class="program-info">${person.program}</p>` : ''}
          <p class="next-position">
            <strong>Next:</strong> ${person.nextPosition}
          </p>
          ${graduationYear ? `<p class="graduation-info">
            <strong>Graduated:</strong> ${this.formatGraduationDate(person.graduationDate)}
          </p>` : ''}
          ${links.length > 0 ? `<div class="person-links">${links.join('')}</div>` : ''}
        </div>
      </div>
    `;
  }

  getPlaceholderImage(category) {
    if (category === 'faculty') {
      return '../../assets/images/people/faculty-placeholder.svg';
    }
    return '../../assets/images/people/student-placeholder.svg';
  }

  formatGraduationDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  showError(message) {
    const containers = ['current-members-container', 'alumni-container'];
    containers.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = `<div class="error-message">${message}</div>`;
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PeoplePage();
});
