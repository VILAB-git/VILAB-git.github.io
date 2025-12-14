// Data Management Utilities for KAIST CVML Website
// This file provides functions to load and manage JSON data

class DataManager {
  constructor() {
    this.cache = {
      news: null,
      publications: null,
      people: null,
      projects: null,
      gallery: null
    };
    this.loadPromises = {};
  }

  // Load JSON data with caching
  async loadData(type) {
    if (this.cache[type]) {
      return this.cache[type];
    }

    if (this.loadPromises[type]) {
      return this.loadPromises[type];
    }

    this.loadPromises[type] = this.fetchData(type);
    try {
      this.cache[type] = await this.loadPromises[type];
      return this.cache[type];
    } catch (error) {
      delete this.loadPromises[type];
      throw error;
    }
  }

  // Fetch data from JSON files
  async fetchData(type) {
    try {
      // Determine correct path based on current location
      const isInSubdirectory = window.location.pathname.includes('/pages/');
      const basePath = isInSubdirectory ? '../../data/' : 'data/';

      const response = await fetch(`${basePath}${type}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${type} data: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error loading ${type} data:`, error);
      // Return fallback data if JSON fails to load
      return this.getFallbackData(type);
    }
  }

  // Fallback data in case JSON files can't be loaded
  getFallbackData(type) {
    if (type === 'news') {
      return {
        news: [
          {
            id: "fallback001",
            date: "2025-08-15",
            content: "The paper \"<strong>3D-Aware Vision-Language Models Fine-Tuning with Geometric Distillation</strong>\" is accepted to <strong>EMNLP 2025 Findings</strong>.",
            category: "publication",
            featured: true
          }
        ]
      };
    } else if (type === 'publications') {
      return {
        publications: [
          {
            id: "fallback001",
            title: "Sample Publication",
            authors: ["Author, A.", "Prof. Name"],
            venue: "Conference 2025",
            year: 2025,
            type: "conference",
            status: "accepted"
          }
        ]
      };
    } else if (type === 'people') {
      return {
        categories: {
          phd: "PhD Students"
        },
        positions: {
          current: "Current Members",
          alumni: "Alumni"
        },
        peoples: [
          {
            id: "fallback001",
            name: "Sample Person",
            email: "person@example.com",
            category: "phd",
            title: "PhD Student"
          }
        ],
        members: {
          current: ["Sample Person"],
          alumni: []
        }
      };
    } else if (type === 'projects') {
      return {
        projects: [
          {
            id: "fallback001",
            title: "Sample Project",
            category: "computer-vision",
            status: "ongoing",
            description: "Sample project description",
          }
        ]
      };
    } else if (type === 'gallery') {
      return {
        gallery_items: [
          {
            id: "fallback001",
            title: "Sample Gallery Item",
            description: "Sample description",
            category: "lab-life",
            date: "2025-01-01",
            image: "../assets/images/gallery/lab-meeting.svg",
            alt_text: "Sample Image"
          }
        ]
      };
    }
    return {};
  }

  // Get news items with filtering and sorting
  async getNews(options = {}) {
    const data = await this.loadData('news');
    let news = [...data.news];

    // Filter by category
    if (options.category) {
      news = news.filter(item => item.category === options.category);
    }

    // Filter by featured
    if (options.featured !== undefined) {
      news = news.filter(item => item.featured === options.featured);
    }

    // Sort by date (newest first)
    news.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit results
    if (options.limit) {
      news = news.slice(0, options.limit);
    }

    return news;
  }


  // Get publications with filtering and sorting
  async getPublications(options = {}) {
    const data = await this.loadData('publications');
    let publications = [...data.publications];

    // Filter by year
    if (options.year) {
      publications = publications.filter(pub => pub.year === options.year);
    }

    // Filter by category
    if (options.category) {
      publications = publications.filter(pub => pub.category === options.category);
    }

    // Filter by type (conference/journal)
    if (options.type) {
      publications = publications.filter(pub => pub.type === options.type);
    }

    // Filter by featured
    if (options.featured !== undefined) {
      publications = publications.filter(pub => pub.featured === options.featured);
    }

    // Sort publications: preprints first, then by year (newest first)
    publications.sort((a, b) => {
      // If one is preprint and other is not, preprint comes first
      if (a.type === 'preprint' && b.type !== 'preprint') return -1;
      if (a.type !== 'preprint' && b.type === 'preprint') return 1;

      // Within same type (both preprints or both not preprints), sort by year (newest first)
      return b.year - a.year;
    });

    // Limit results
    if (options.limit) {
      publications = publications.slice(0, options.limit);
    }

    return publications;
  }

  // Get unique years from publications (recent 5 years only)
  async getPublicationYears() {
    const data = await this.loadData('publications');
    const allYears = [...new Set(data.publications.map(pub => pub.year))];
    const sortedYears = allYears.sort((a, b) => b - a);
    // Return only the recent 5 years
    return sortedYears.slice(0, 5);
  }

  // Get publication categories
  async getPublicationCategories() {
    const data = await this.loadData('publications');
    return data.categories || {};
  }

  // Get publication venues
  async getPublicationVenues() {
    const data = await this.loadData('publications');
    return data.venues || {};
  }

  // Search functionality
  async searchPublications(query) {
    const data = await this.loadData('publications');
    const searchTerm = query.toLowerCase();

    return data.publications.filter(pub =>
      pub.title.toLowerCase().includes(searchTerm) ||
      pub.authors.some(author => author.toLowerCase().includes(searchTerm)) ||
      pub.venue.toLowerCase().includes(searchTerm) ||
      (pub.presentation && pub.presentation.toLowerCase().includes(searchTerm)) ||
      (pub.keywords && pub.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) ||
      (pub.abstract && pub.abstract.toLowerCase().includes(searchTerm))
    );
  }

  // Get people with filtering and sorting
  async getPeople(options = {}) {
    const data = await this.loadData('people');
    const allPeople = data.peoples || [];
    const members = data.members || {};

    let people = [...allPeople];

    // position(current/alumni)으로 필터링
    if (options.position) {
      const names = members[options.position] || [];
      people = people.filter(person => names.includes(person.name));
    }

    // category로 필터링
    if (options.category) {
      people = people.filter(person => person.category === options.category);
    }

    // 정렬 로직 (원하면 유지/수정)
    if (options.position === 'current') {
      const categoryOrder = ['postdoc', 'phd', 'ms', 'undergraduate', 'intern', 'visiting', 'staff'];
      people.sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.category);
        const bIndex = categoryOrder.indexOf(b.category);
        if (aIndex !== bIndex) return aIndex - bIndex;
        return new Date(a.joinDate || '2000-01-01') - new Date(b.joinDate || '2000-01-01');
      });
    } else if (options.position === 'alumni') {
      people.sort(
        (a, b) =>
          new Date(b.graduationDate || '2000-01-01') -
          new Date(a.graduationDate || '2000-01-01')
      );
    }

    if (options.limit) {
      people = people.slice(0, options.limit);
    }

    return people;
  }

  // Get current members
  async getCurrentMembers(options = {}) {
    const data = await this.loadData('people');
    const allPeople = data.peoples || [];
    const members = data.members || {};
    const currentNames = members.current || [];

    let current = allPeople.filter(person => currentNames.includes(person.name));

    if (options.category) {
      current = current.filter(person => person.category === options.category);
    }

    current.sort(
      (a, b) =>
        new Date(a.joinDate || '2000-01-01') -
        new Date(b.joinDate || '2000-01-01')
    );

    if (options.limit) {
      current = current.slice(0, options.limit);
    }

    return current;
  }

  // Get alumni
  async getAlumni(options = {}) {
    const data = await this.loadData('people');
    const allPeople = data.peoples || [];
    const members = data.members || {};
    const alumniNames = members.alumni || [];

    let alumni = allPeople.filter(person => alumniNames.includes(person.name));

    if (options.category) {
      alumni = alumni.filter(person => person.category === options.category);
    }

    alumni.sort(
      (a, b) =>
        new Date(b.graduationDate || '2000-01-01') -
        new Date(a.graduationDate || '2000-01-01')
    );

    if (options.limit) {
      alumni = alumni.slice(0, options.limit);
    }

    return alumni;
  }

  // Get people categories
  async getPeopleCategories() {
    const data = await this.loadData('people');
    return data.categories || {};
  }

  // Get people positions
  async getPeoplePositions() {
    const data = await this.loadData('people');
    return data.positions || {};
  }

  // Search people functionality
  async searchPeople(query, position = null) {
    const data = await this.loadData('people');
    const searchTerm = query.toLowerCase();
    const allPeople = data.peoples || [];
    const members = data.members || {};

    let people = [...allPeople];

    // position(current/alumni)으로 제한
    if (position) {
      const names = members[position] || [];
      people = people.filter(person => names.includes(person.name));
    }

    return people.filter(person =>
      person.name.toLowerCase().includes(searchTerm) ||
      (person.title && person.title.toLowerCase().includes(searchTerm)) ||
      (person.email && person.email.toLowerCase().includes(searchTerm)) ||
      (person.nextPosition && person.nextPosition.toLowerCase().includes(searchTerm)) ||
      (person.researchInterests &&
        person.researchInterests.some(interest =>
          interest.toLowerCase().includes(searchTerm)
        ))
    );
  }

  // === PROJECTS METHODS ===

  // Get projects with filtering and sorting
  async getProjects(options = {}) {
    const data = await this.loadData('projects');
    let projects = [...data.projects];

    // Filter by category
    if (options.category) {
      projects = projects.filter(project => project.category === options.category);
    }

    // Filter by status
    if (options.status) {
      projects = projects.filter(project => project.status === options.status);
    }

    // Sort by status priority (ongoing first, then planned, then completed)
    const statusOrder = ['ongoing', 'planned', 'completed'];
    projects.sort((a, b) => {
      const aIndex = statusOrder.indexOf(a.status);
      const bIndex = statusOrder.indexOf(b.status);
      return aIndex - bIndex;
    });

    // Limit results
    if (options.limit) {
      projects = projects.slice(0, options.limit);
    }

    return projects;
  }

  // Get project categories
  async getProjectCategories() {
    const data = await this.loadData('projects');
    return data.categories || {};
  }

  // Get project status options
  async getProjectStatuses() {
    const data = await this.loadData('projects');
    return data.status || {};
  }

  // Search projects functionality
  async searchProjects(query) {
    const data = await this.loadData('projects');
    const searchTerm = query.toLowerCase();

    return data.projects.filter(project =>
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm)
    );
  }

  // === NEWS METHODS ===
  
  // Get single news item by id or slug
  async getNewsItem(idOrSlug) {
    const data = await this.loadData('news');
    const items = data.news || [];
    return (
      items.find(
        item => item.id === idOrSlug || item.slug === idOrSlug
      ) || null
    );
  }

  // === GALLERY METHODS ===

  // Get gallery items with filtering and sorting
  async getGalleryItems(options = {}) {
    const data = await this.loadData('gallery');
    let items = [...data.gallery_items];

    // Filter by category
    if (options.category) {
      items = items.filter(item => item.category === options.category);
    }

    // Filter by featured
    if (options.featured !== undefined) {
      items = items.filter(item => item.featured === options.featured);
    }

    // Sort by date (newest first)
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit results
    if (options.limit) {
      items = items.slice(0, options.limit);
    }

    return items;
  }

  // Get gallery categories
  async getGalleryCategories() {
    const data = await this.loadData('gallery');
    return data.categories || {};
  }

  // Get featured gallery items
  async getFeaturedGalleryItems(limit = 6) {
    return this.getGalleryItems({ featured: true, limit });
  }

  // Search gallery functionality
  async searchGallery(query) {
    const data = await this.loadData('gallery');
    const searchTerm = query.toLowerCase();

    return data.gallery_items.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
      (item.venue && item.venue.toLowerCase().includes(searchTerm)) ||
      (item.location && item.location.toLowerCase().includes(searchTerm))
    );
  }

  // === UTILITY METHODS ===

  // Format date for display
  formatDate(dateString, format = 'short') {
    const date = new Date(dateString);

    if (format === 'short') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    } else if (format === 'long') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    return dateString;
  }

  // Clear cache (useful for development)
  clearCache() {
    this.cache = {
      news: null,
      publications: null,
      people: null,
      projects: null,
      gallery: null
    };
    this.loadPromises = {};
  }
}

// Create global instance
window.dataManager = new DataManager();
