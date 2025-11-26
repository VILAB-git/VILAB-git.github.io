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

    // Display all alumni in one section without grouping by category
    let html = `
      <div class="people-category">
        <div class="people-grid">
          ${this.alumni.map(person => this.createAlumniCard(person)).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
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
      ? `../assets/images/people/${person.image}`
      : this.getPlaceholderImage(person.category);

    const links = [];
    if (person.website) {
      links.push(`<a href="${person.website}" target="_blank" class="person-link">Website</a>`);
    }
    if (person.googleScholar) {
      links.push(`<a href="${person.googleScholar}" target="_blank" class="person-link">Google Scholar</a>`);
    }
    if (person.linkedin) {
      links.push(`<a href="${person.linkedin}" target="_blank" class="person-link">LinkedIn</a>`);
    }

    return `
      <div class="person-card">
        <div class="person-photo">
          <img src="${imagePath}" alt="${person.name}" class="photo" style="width: 150px; height: 150px; object-fit: cover;"
               onerror="this.src='${this.getPlaceholderImage(person.category)}'">
        </div>
        <div class="person-info">
          <h3 class="person-name">${person.name}</h3>
          ${person.major ? `<p class="person-major">${person.major}</p>` : ''}
          ${person.email ? `<p class="person-email">${person.email}</p>` : ''}
          ${person.affiliation ? `<p class="person-affiliation">${person.affiliation}</p>` : ''}
          ${person.researchInterests ? `
            <p class="research-interests" style="font-weight: normal;"><span style="font-weight: bold;">Research Interests:</span> ${person.researchInterests.join(', ')}</p>
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

    const links = [];
    if (person.website) {
      links.push(`<a href="${person.website}" target="_blank" class="person-link">Website</a>`);
    }
    if (person.googleScholar) {
      links.push(`<a href="${person.googleScholar}" target="_blank" class="person-link">Google Scholar</a>`);
    }
    if (person.linkedin) {
      links.push(`<a href="${person.linkedin}" target="_blank" class="person-link">LinkedIn</a>`);
    }

    return `
      <div class="person-card alumni-card">
        <div class="person-info">
          <h3 class="person-name">${person.name}</h3>
          <p class="person-title">${person.title}</p>
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
      return '../assets/images/people/faculty-placeholder.svg';
    }
    return '../assets/images/people/student-placeholder.svg';
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
