class FacultyPage {
  constructor() {
    this.init();
  }

  async init() {
    try {
      const data = await this.loadJSON("../../data/faculty.json");
      this.renderFaculty(data);
    } catch (err) {
      console.error("Error loading faculty:", err);
      const c = document.getElementById("faculty-container");
      if (c) c.innerHTML = "<p class='error-message'>Failed to load faculty information.</p>";
    }
  }

  async loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to load JSON");
    return await res.json();
  }

  renderFaculty(data) {
    const container = document.getElementById("faculty-container");
    if (!container) return;

    const introText =
        data.intro && data.intro.trim().length > 0 ? data.intro : "TBD.";

    container.innerHTML = `
        <div class="faculty-page">

        <!-- 상단: 사진 + 소개 -->
        <div class="faculty-header">
            <div class="faculty-photo-block">
            <img src="${data.photo}" alt="${data.name}" class="faculty-photo" />
            <p class="faculty-name">${data.name}</p>
            <p class="faculty-position">${data.title}</p>
            <p class="faculty-email">
                <a href="mailto:${data.email}">${data.email}</a>
            </p>
            ${
                data.office
                ? `<p class="faculty-office">Office: ${data.office}</p>`
                : ""
            }
            </div>

            <div class="faculty-intro-block">
            <p class="faculty-intro-text">${introText}</p>

            <div class="faculty-links">
                ${
                    data.cv
                    ? `
                        <a href="${data.cv}" 
                        target="_blank" class="icon-btn" aria-label="Curriculum Vitae">
                        <i class="ai ai-cv"></i>
                        </a>
                    `
                    : ""
                }    
                ${
                    data.google_scholar
                    ? `
                        <a href="${data.google_scholar}" 
                        target="_blank" class="icon-btn" aria-label="Google Scholar">
                        <i class="ai ai-google-scholar"></i>
                        </a>
                    `
                    : ""
                }
            </div>
        </div>
        </div>

        <hr class="faculty-divider" />

        ${this.section("Professional Experience", this.renderExperience(data.experience || []))}

        ${this.section("Corporate & Technical Advisories", this.renderAdvisory(data.advisory || []))}

        ${this.section("Education", this.renderEducation(data.education || []))}

        ${this.section("Honors & Awards", this.renderAwards(data.awards || []))}

        ${this.section("Professional & Public Service", this.renderPublicService(data.service_professional_public || []))}

        ${this.section("Academic Service", this.renderAcademicService(data.service_academic))}
        </div>
    `;
  }

  section(title, content) {
    if (!content || content.trim() === "") return "";
    return `
      <div class="faculty-section-block">
        <h3 class="faculty-section-title">${title}</h3>
        <div class="faculty-section-content">
          ${content}
        </div>
      </div>
    `;
  }

  renderExperience(items) {
    if (!items || !items.length) return "";

    return `
        <div class="exp-list">
        ${items
            .map(
            (e) => `
            <div class="exp-item">
            <div class="exp-main">
                <span class="exp-role"><strong>${e.role}</strong></span>
                ${e.major ? `, <span class="exp-major">${e.major}</span>` : ""}
                ${e.org ? `, <span class="exp-org">${e.org}</span>` : ""}
            </div>
            ${e.period ? `<div class="exp-period">${e.period}</div>` : ""}

            ${
                e.details && e.details.length
                ? `<ul class="exp-details">
                    ${e.details
                        .map((d) => {
                        if (typeof d === "string") {
                            return `<li>${d}</li>`;
                        }
                        return `<li>
                            <span class="exp-detail-role">${d.role}</span>
                            ${
                            d.period
                                ? `<span class="exp-detail-period">${d.period}</span>`
                                : ""
                            }
                        </li>`;
                        })
                        .join("")}
                    </ul>`
                : ""
            }
            </div>
        `
            )
            .join("")}
        </div>
    `;
  }

  renderAdvisory(items) {
    if (!items || !items.length) return "";

    return `
        <div class="adv-list">
        ${items
            .map(
            (a) => `
            <div class="adv-item">
            <div class="adv-main">
                <span class="adv-role"><strong>${a.role}</strong></span>
                ${a.org ? `, <span class="adv-org">${a.org}</span>` : ""}
            </div>
            ${a.period ? `<div class="adv-period">${a.period}</div>` : ""}
            </div>
        `
            )
            .join("")}
        </div>
    `;
  }

  renderEducation(items) {
    if (!items || !items.length) return "";

    return `
        <div class="edu-list">
        ${items
            .map(
            (e) => `
            <div class="edu-item">
            <div class="edu-main">
                <span class="edu-degree"><strong>${e.degree}</strong></span>,
                <span class="edu-school">${e.school}</span>
            </div>
            ${e.year ? `<div class="edu-year">${e.year}</div>` : ""}

            ${
                e.thesis
                ? `<div class="edu-thesis">
                    <span class="edu-thesis-label">Thesis:</span>
                    <span class="edu-thesis-title">${e.thesis}</span>
                    </div>`
                : ""
            }
            </div>
        `
            )
            .join("")}
        </div>
    `;
  }

  renderAwards(awards) {
    if (!awards || !awards.length) return "";

    return `
        <ul class="award-list">
        ${awards
            .map(
            (a) => `
            <li class="award-item">
            <span class="award-name">${a.name}</span>
            ${a.year ? `<span class="award-year">${a.year}</span>` : ""}
            </li>
        `
            )
            .join("")}
        </ul>
    `;
  }

  renderPublicService(items) {
    if (!items || !items.length) return "";

    return `
        <ul class="public-service-list">
        ${items
            .map(
            (item) => `
            <li class="public-service-item">
            <span class="public-service-name">${item.name}</span>
            ${
                item.period
                ? `<span class="public-service-period">${item.period}</span>`
                : ""
            }
            </li>
        `
            )
            .join("")}
        </ul>
    `;
  }

  renderAcademicService(service) {
    if (!service) return "";

    const renderOrg = (orgList) => {
        if (!orgList || !orgList.length) return "";

        // Case 1: 문자열 리스트 → comma-separated
        if (typeof orgList[0] === "string") {
        return `
            <div class="academic-org-inline">
            ${orgList.join(", ")}
            </div>
        `;
        }

        // Case 2: 객체 리스트 → name + period
        return `
        <ul class="academic-org-list">
            ${orgList
            .map(org => `
                <li class="academic-org-item">
                <span class="academic-org-name">${org.name}</span>
                ${org.period ? `<span class="academic-org-period">${org.period}</span>` : ""}
                </li>
            `)
            .join("")}
        </ul>
        `;
    };

    const renderGroup = (title, items) => {
        if (!items || !items.length) return "";

        return `
        <div class="academic-group">
            <h3 class="academic-group-title">${title}</h3>
            ${items
            .map(
                item => `
                <div class="academic-role-block">
                <div class="academic-role">${item.role}</div>
                <div class="academic-org-wrapper">
                    ${renderOrg(item.org)}
                </div>
                </div>
            `
            )
            .join("")}
        </div>
        `;
    };

    return `
        <div class="academic-service-wrapper">
        ${renderGroup("International", service.International)}
        ${renderGroup("Domestic", service.Domestic)}
        </div>
    `;
  }

  renderList(list) {
    if (!list.length) return "";
    return `<ul class="list-block">
      ${list.map((item) => `<li>${item}</li>`).join("")}
    </ul>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FacultyPage();
});
