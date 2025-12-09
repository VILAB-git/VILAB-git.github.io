// Publications Page JavaScript - JSON-based management
document.addEventListener('DOMContentLoaded', async function () {
  const publicationsContainer = document.querySelector('.publications-content');
  const filterContainer = document.querySelector('.publication-filters');
  const searchInput = document.querySelector('.publication-search input');

  let allPublications = [];
  let currentFilter = 'all';
  let currentSearch = '';

  // Initialize publications page
  await initializePublications();


  const TOP_CV = ['CVPR', 'ECCV', 'ICCV'];

  // ---- Patent helpers ----
  function getYearFromDateStr(dateStr) {
    if (!dateStr) return null;
    // "2024.03.05" / "2013.10.30" 등에서 연도 4자리 추출
    const match = String(dateStr).match(/(\d{4})/);
    return match ? parseInt(match[1], 10) : null;
  }

  function getPatentYear(pub) {
    // registration_date 우선, 없으면 application_date 사용
    const regYear = getYearFromDateStr(pub.registration_date);
    if (regYear) return regYear;
    const appYear = getYearFromDateStr(pub.application_date);
    return appYear || null;
  }

  function enrichPublicationsWithPatentYear(publications) {
    publications.forEach((pub) => {
      if (pub.type === 'patent') {
        const y = getPatentYear(pub);
        if (y) {
          pub.year = y; // 기존 year 필드가 있더라도 여기서 덮어씀
        }
      }
    });
  }

  function getYearGroup(year) {
    if (year >= 2026) return '2026';
    if (year === 2025) return '2025';
    if (year === 2024) return '2024';
    if (year === 2023) return '2023';
    if (year === 2022) return '2022';
    if (year === 2021) return '2021';
    return '-2020'; 
  }

  function getVenueGroup(pub) {
    if (TOP_CV.includes(pub.venue)) return pub.venue;
    for (const venue of TOP_CV) {
      if (pub.venue.includes(venue)) return venue;
    }
    if (pub.type === 'journal') return 'Journals';            
    if (pub.type === 'conference') return 'Other Conferences'; 
    if (pub.type === 'patent') return 'Patents';
    return 'Other';
  }

  await initializePublications();

  // Load publications from JSON
  async function initializePublications() {
    try {
      // Load publications data
      allPublications = await window.dataManager.getPublications();

      // 특허 year 정보 주입
      enrichPublicationsWithPatentYear(allPublications);

      // Create filter buttons
      await createFilterButtons();

      // Display publications
      displayPublications(allPublications);

      // Setup event listeners
      setupEventListeners();

    } catch (error) {
      console.error('Error initializing publications:', error);
      showErrorMessage();
    }
  }

  // Create dynamic filter buttons based on available years
  // async function createFilterButtons() {
  //   if (!filterContainer) return;

  //   const years = await window.dataManager.getPublicationYears();
  //   const categories = await window.dataManager.getPublicationCategories();

  //   filterContainer.innerHTML = `
  //     <div class="filter-group">
  //       <label>Filter by Year:</label>
  //       <button class="filter-btn active" data-filter="year" data-value="all">All Years</button>
  //       ${years.map(year => `<button class="filter-btn" data-filter="year" data-value="${year}">${year}</button>`).join('')}
  //     </div>
  //     <div class="filter-group">
  //       <label>Filter by Category:</label>
  //       <button class="filter-btn active" data-filter="category" data-value="all">All Categories</button>
  //       ${Object.entries(categories).map(([key, label]) =>
  //     `<button class="filter-btn" data-filter="category" data-value="${key}">${label}</button>`
  //   ).join('')}
  //     </div>
  //     <div class="filter-group">
  //       <label>Filter by Type:</label>
  //       <button class="filter-btn active" data-filter="type" data-value="all">All Types</button>
  //       <button class="filter-btn" data-filter="type" data-value="conference">Conferences</button>
  //       <button class="filter-btn" data-filter="type" data-value="journal">Journals</button>
  //       <button class="filter-btn" data-filter="type" data-value="workshop">Workshops</button>
  //       <button class="filter-btn" data-filter="type" data-value="preprint">Preprints</button>
  //     </div>
  //   `;
  // }

  async function createFilterButtons() {
    if (!filterContainer) return;

    filterContainer.innerHTML = `
      <div class="filter-group">
        <label>Filter by Year:</label>
        <button class="filter-btn active" data-filter="year" data-value="all">All Years</button>
        <button class="filter-btn" data-filter="year" data-value="2026">2026</button>
        <button class="filter-btn" data-filter="year" data-value="2025">2025</button>
        <button class="filter-btn" data-filter="year" data-value="2024">2024</button>
        <button class="filter-btn" data-filter="year" data-value="2023">2023</button>
        <button class="filter-btn" data-filter="year" data-value="2022">2022</button>
        <button class="filter-btn" data-filter="year" data-value="2021">2021</button>
        <button class="filter-btn" data-filter="year" data-value="-2020">-2020</button>
      </div>
      <div class="filter-group">
        <label>Filter by Venue:</label>
        <button class="filter-btn active" data-filter="venue" data-value="all">All Venues</button>
        <button class="filter-btn" data-filter="venue" data-value="CVPR">CVPR</button>
        <button class="filter-btn" data-filter="venue" data-value="ICCV">ICCV</button>
        <button class="filter-btn" data-filter="venue" data-value="ECCV">ECCV</button>
        <button class="filter-btn" data-filter="venue" data-value="Other Conferences">Other Conferences</button>
        <button class="filter-btn" data-filter="venue" data-value="Journals">Journals</button>
        <button class="filter-btn" data-filter="venue" data-value="Patents">Patents</button>
      </div>
      <!-- Status Filter group visualized when Patents selected -->
      <div class="filter-group filter-group-status hidden">
        <label>Filter by Status:</label>
        <button class="filter-btn active" data-filter="status" data-value="all">All</button>
        <button class="filter-btn" data-filter="status" data-value="active">Active</button>
        <button class="filter-btn" data-filter="status" data-value="expired">Expired</button>
        <button class="filter-btn" data-filter="status" data-value="application">Application</button>
      </div>
    `;
  }


  // Display publications grouped by year with preprints first
  function displayPublications(publications) {
    if (!publicationsContainer) return;

    if (publications.length === 0) {
      publicationsContainer.innerHTML = '<div class="no-results">No publications found matching your criteria.</div>';
      return;
    }

    // Separate preprints from other publications
    const preprints = publications.filter(pub => pub.type === 'preprint');
    const otherPublications = publications.filter(pub => pub.type !== 'preprint');

    let html = '';

    // Add preprints section if there are any
    if (preprints.length > 0) {
      html += `
        <div class="year-section" data-year="preprints">
          <h2 class="year-title">Preprints</h2>
          <div class="publications-list">
            ${preprints.map(pub => createPublicationHTML(pub)).join('')}
          </div>
        </div>
      `;
    }

    // Group other publications by year
    const publicationsByYear = groupPublicationsByYear(otherPublications);

    // Add other publications by year
    Object.keys(publicationsByYear).sort((a, b) => b - a).forEach(year => {
      html += `
        <div class="year-section" data-year="${year}">
          <h2 class="year-title">${year}</h2>
          <div class="publications-list">
            ${publicationsByYear[year].map(pub => createPublicationHTML(pub)).join('')}
          </div>
        </div>
      `;
    });

    publicationsContainer.innerHTML = html;

    // Add animations
    setTimeout(() => {
      const items = publicationsContainer.querySelectorAll('.publication-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 100);
  }

  // Group publications by year
  function groupPublicationsByYear(publications) {
    return publications.reduce((groups, pub) => {
      const year = pub.year;
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(pub);
      return groups;
    }, {});
  }

  // // Create HTML for a single publication
  // function createPublicationHTML(pub) {
  //   const formattedDate = window.dataManager.formatDate(pub.date, 'short');

  //   return `
  //     <div class="publication-item ${pub.featured ? 'featured' : ''}" data-category="${pub.category}" data-type="${pub.type}">
  //       <div class="publication-content">
  //         <h3 class="publication-title">${pub.title}</h3>
  //         <p class="publication-authors">${pub.authors.join(', ')}</p>
  //         <p class="publication-venue">
  //           <strong>${pub.venue} ${pub.year}</strong>
  //           ${pub.presentation ? ` (${pub.presentation.charAt(0).toUpperCase() + pub.presentation.slice(1)})` : ''}
  //         </p>
  //         ${pub.abstract ? `<p class="publication-description">${pub.abstract}</p>` : ''}
  //         ${pub.keywords ? `<div class="publication-keywords">
  //           ${pub.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
  //         </div>` : ''}
  //         <div class="publication-links">
  //           ${pub.pdf_url && pub.pdf_url !== '#' ? `<a href="${pub.pdf_url}" class="pub-link">Paper</a>` : ''}
  //           ${pub.supp_url && pub.supp_url !== '#' ? `<a href="${pub.supp_url}" class="pub-link">Supp</a>` : ''}
  //           ${pub.arxiv_url && pub.arxiv_url !== '#' ? `<a href="${pub.arxiv_url}" class="pub-link">ArXiv</a>` : ''}
  //           ${pub.code_url && pub.code_url !== '#' ? `<a href="${pub.code_url}" class="pub-link">Code</a>` : ''}
  //           ${pub.project_url && pub.project_url !== '#' ? `<a href="${pub.project_url}" class="pub-link">Project Page</a>` : ''}
  //         </div>
  //       </div>
  //     </div>
  //   `;
  // }

  // Create HTML for a single publication (patent)
  function createPublicationHTML(pub) {
    const isPatent = pub.type === 'patent';
  
    // venue + year 텍스트 (year가 없으면 venue만)
    const yearText = pub.year ? ` ${pub.year}` : '';
    const venueText = `${pub.venue}${yearText}`;

    // 특허용 메타 정보 (출원/등록/상태)
    let patentMetaHTML = '';
    if (isPatent) {
      const hasApp = pub.application_no || pub.application_date;
      const hasReg = pub.registration_no || pub.registration_date;

      if (hasReg) {
        patentMetaHTML += `
          <p class="publication-patent-meta">
            Registration (등록): 
            ${pub.country ? `<strong>${pub.country}</strong>, ` : ''}
            ${pub.registration_no ? `<strong>${pub.registration_no}</strong>` : ''}
            ${pub.registration_date ? ` (${pub.registration_date})` : ''}
          </p>
        `;
      }

      if (hasApp) {
        patentMetaHTML += `
          <p class="publication-patent-meta">
            Application (출원): 
            ${pub.country ? `<strong>${pub.country}</strong>, ` : ''}
            ${pub.application_no ? `<strong>${pub.application_no}</strong>` : ''}
            ${pub.application_date ? ` (${pub.application_date})` : ''}
          </p>
        `;
      }

      if (pub.status) {
        patentMetaHTML += `
          <p class="publication-patent-meta">
            Status: <strong>${pub.status}</strong>
          </p>
        `;
      }
    }
    
    return `
      <div class="publication-item ${pub.featured ? 'featured' : ''}" 
           data-category="${pub.category}" 
           data-type="${pub.type}">
        
        <div class="publication-content">
  
          <!-- Title -->
          <h3 class="publication-title">
            ${pub.title}
            ${pub.title_kor ? `<br><span class="publication-title-kor">${pub.title_kor}</span>` : ''}
          </h3>
  
          <!-- Authors -->
          ${pub.authors && pub.authors.length ? `
            <p class="publication-authors">${pub.authors.join(', ')}</p>
          ` : ''}

          ${pub.authors_kor && pub.authors_kor.length ? `
            <p class="publication-authors-kor">${pub.authors_kor.join(', ')}</p>
          ` : ''}
  
          <!-- Venue -->
          <p class="publication-venue">
            <strong>${venueText}</strong>
          </p>

          <!-- 특허일 때만 application/registration/status 표시 -->
          ${patentMetaHTML}
  
          <!-- Abstract -->
          ${pub.abstract && !isPatent ? `<p class="publication-description">${pub.abstract}</p>` : ''}
  
          <!-- Keywords -->
          ${pub.keywords ? `
            <div class="publication-keywords">
              ${pub.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
            </div>` 
          : ''}
  
          <!-- Links -->
          <div class="publication-links">
            ${pub.pdf_url ? `<a href="${pub.pdf_url}" class="pub-link">Paper</a>` : ''}
            ${pub.supp_url ? `<a href="${pub.supp_url}" class="pub-link">Supp</a>` : ''}
            ${pub.arxiv_url ? `<a href="${pub.arxiv_url}" class="pub-link">ArXiv</a>` : ''}
            ${pub.code_url ? `<a href="${pub.code_url}" class="pub-link">Code</a>` : ''}
            ${pub.project_url ? `<a href="${pub.project_url}" class="pub-link">Project Page</a>` : ''}
          </div>
  
        </div>
      </div>
    `;
  }

  // Setup event listeners
  function setupEventListeners() {
    // Filter buttons
    if (filterContainer) {
      filterContainer.addEventListener('click', handleFilterClick);
    }

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }
  }

  // Handle filter button clicks
  function handleFilterClick(e) {
    if (!e.target.classList.contains('filter-btn')) return;

    const filterType = e.target.dataset.filter;
    const filterValue = e.target.dataset.value;

    // Update active button in the same group
    const filterGroup = e.target.closest('.filter-group');
    filterGroup.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    if (filterType === 'venue') {
    const statusGroup = filterContainer.querySelector('.filter-group-status');
    if (statusGroup) {
      if (filterValue === 'Patents') {
        statusGroup.classList.remove('hidden');
      } else {
        // 다른 venue 선택 시 status 필터 리셋 + 숨김
        statusGroup.classList.add('hidden');
        const allStatusBtn = statusGroup.querySelector('[data-filter="status"][data-value="all"]');
        statusGroup.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        if (allStatusBtn) allStatusBtn.classList.add('active');
      }
    }
  }

    // Apply filter
    applyFilters();
  }

  // Handle search input
  function handleSearch(e) {
    currentSearch = e.target.value.toLowerCase();
    applyFilters();
  }

  // Apply all active filters
  async function applyFilters() {
    const activeFilters = {
      year: getActiveFilterValue('year'),
      venue: getActiveFilterValue('venue'),
      status: getActiveFilterValue('status')
      // category: getActiveFilterValue('category'),
      // type: getActiveFilterValue('type')
    };

    let filteredPublications = [...allPublications];

    // Apply year filter
    if (activeFilters.year !== 'all') {
      const yearFilter = activeFilters.year;

      if (yearFilter.startsWith('-')) {
        // "-2022" 같은 케이스: 해당 연도 이하 모두
        const limitYear = parseInt(yearFilter.slice(1), 10); // "2022" → 2022
        filteredPublications = filteredPublications.filter(pub => Number(pub.year) <= limitYear);
      } else {
        // 일반적인 단일 연도 필터 (2023, 2024, 2025, 2026)
        filteredPublications = filteredPublications.filter(
          pub => pub.year.toString() === yearFilter
        );
      }
    }

    // Apply venue filter
    if (activeFilters.venue !== 'all') {
      const v = activeFilters.venue;

      if (['CVPR', 'ICCV', 'ECCV'].includes(v)) {
        // Top conference만
        // filteredPublications = filteredPublications.filter(pub => pub.venue === v);
        filteredPublications = filteredPublications.filter(pub =>
          pub.venue === v || pub.venue.includes(v)  
        );
      } else if (v === 'Journals') {
        filteredPublications = filteredPublications.filter(pub => pub.type === 'journal');
      } else if (v === 'Patents') {
        filteredPublications = filteredPublications.filter(pub => pub.type === 'patent');
      } else if (v === 'Other Conferences') {
        filteredPublications = filteredPublications.filter(
          pub => 
            pub.type === 'conference' && 
            !TOP_CV.includes(pub.venue) &&
            !TOP_CV.some(top => pub.venue.includes(top))
        );
      } 
    }

    // --- Status 필터 (Patents용) ---
    if (activeFilters.status !== 'all') {
      const statusVal = activeFilters.status.toLowerCase();
      filteredPublications = filteredPublications.filter(pub => {
        if (pub.type !== 'patent') return false;
        const s = (pub.status || '').toLowerCase();

        if (statusVal === 'application') {
          // 🔹 Application 버튼일 때: application + withdrawal 모두 포함
          return s === 'application' || s === 'withdrawal';
        }

        return s === statusVal; // active, expired 등은 그대로 매칭
      });
    }

    // // Apply category filter
    // if (activeFilters.category !== 'all') {
    //   filteredPublications = filteredPublications.filter(pub => pub.category === activeFilters.category);
    // }

    // // Apply type filter
    // if (activeFilters.type !== 'all') {
    //   filteredPublications = filteredPublications.filter(pub => pub.type === activeFilters.type);
    // }

    // Apply search filter
    if (currentSearch) {
      filteredPublications = await window.dataManager.searchPublications(currentSearch);
      // Re-apply other filters to search results
      if (activeFilters.year !== 'all') {
        filteredPublications = filteredPublications.filter(pub => pub.year.toString() === activeFilters.year);
      }

      if (activeFilters.venue !== 'all') {
        const v = activeFilters.venue;
  
        if (['CVPR', 'ICCV', 'ECCV'].includes(v)) {
          filteredPublications = filteredPublications.filter(pub => pub.venue === v);
        } else if (v === 'Journals') {
          filteredPublications = filteredPublications.filter(pub => pub.type === 'journal');
        } else if (v === 'Patents') { 
          filteredPublications = filteredPublications.filter(pub => pub.type === 'patent');
        } else if (v === 'Other Conferences') {
          filteredPublications = filteredPublications.filter(
            pub => pub.type === 'conference' && !TOP_CV.includes(pub.venue)
          );
        }
      }

      // Status
      if (activeFilters.status !== 'all') {
        const statusVal = activeFilters.status.toLowerCase();
        filteredPublications = filteredPublications.filter(pub => {
          if (pub.type !== 'patent') return false;
          const s = (pub.status || '').toLowerCase();

          if (statusVal === 'application') {
            return s === 'application' || s === 'withdrawal';
          }

          return s === statusVal;
        });
      }
      // if (activeFilters.category !== 'all') {
      //   filteredPublications = filteredPublications.filter(pub => pub.category === activeFilters.category);
      // }
      // if (activeFilters.type !== 'all') {
      //   filteredPublications = filteredPublications.filter(pub => pub.type === activeFilters.type);
      // }
    }

    displayPublications(filteredPublications);
  }

  // Get active filter value for a specific filter type
  function getActiveFilterValue(filterType) {
    const activeBtn = filterContainer.querySelector(`[data-filter="${filterType}"].active`);
    return activeBtn ? activeBtn.dataset.value : 'all';
  }

  // Show error message
  function showErrorMessage() {
    if (publicationsContainer) {
      publicationsContainer.innerHTML = `
        <div class="error-message">
          <h3>Error Loading Publications</h3>
          <p>We're having trouble loading the publications data. Please try refreshing the page.</p>
        </div>
      `;
    }
  }

  // Export functions for external use
  window.publicationsManager = {
    refreshData: async function () {
      window.dataManager.clearCache();
      await initializePublications();
    },
    searchPublications: function (query) {
      if (searchInput) {
        searchInput.value = query;
        handleSearch({ target: searchInput });
      }
    }
  };
});
