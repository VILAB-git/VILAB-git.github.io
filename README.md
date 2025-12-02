# KAIST Visual Intelligence Lab Website

Internal guide for managing and updating the official VILab website.  
This repository powers **https://vi.kaist.ac.kr** via GitHub Pages.

---

## 🚀 Overview

This repository contains the complete source code of VILab's public website, including all HTML pages, JSON-based content data, JavaScript utilities, CSS styles, and image assets.  
All lab members with appropriate GitHub permissions may update the website.

---

## 🔐 Access & Setup

### 1. Clone the repository

Make sure you are logged in with the VILAB-git account or an account with push permission.

```bash
git clone https://github.com/VILAB-git/VILAB-git.github.io.git
cd VILAB-git.github.io
```

## 🖥️ Local Testing (MANDATORY BEFORE COMMIT)

You must check the website locally before committing & pushing changes.
```bash
# Navigate to the project folder
cd VILAB-git.github.io

# Start local server
python3 -m http.server 8000

# Open in browser
http://localhost:8000
```

### **Verify**:
- JSON loads correctly (no syntax errors)
- All images appear correctly
- Layout and responsiveness behave normally
- Filters, search boxes, and dynamic UI work as expected

⚠️ **Do NOT commit or push without verifying the result locally.**

## 🖥️ How to Commit and Push
### Before Commit, Always Test Locally using `python3 -m http.server 8000`
Make sure you are logged in with the VILAB-git account or an account with push permission.

Follow the next commands in `bash`
```bash
cd VILAB-git.github.io
git pull
git add .
git commit -a -m "Commit Messages"
git push
```

---

## 📁 File Structure

```
├── index.html          # Home
├── pages/              # All pages
│   ├── home/
│   ├── people/
│   ├── faculty/
│   ├── research/
│   ├── publications/
│   ├── projects/
│   ├── news/
│   ├── news-detail/
│   ├── gallery/
│   └── contact/
├── data/               # Content (JSON files)
│   ├── people.json
│   ├── faculty.json
│   ├── research.json
│   ├── publications.json
│   ├── projects.json
│   ├── news.json
│   └── gallery.json
├── assets/
│   ├── docs/           # Professor CV
│   ├── images/
│   │   ├── main/       # Home photos
│   │   ├── people/     # Profile photos
│   │   ├── research/   # Research images/videos
│   │   ├── news/       # News images
│   │   └── gallery/    # Gallery photos
│   └── logos/
├── js/                 # JavaScript files
└── css/                # Styling
```

## 🔧 Common Tasks

### Publishing Changes
1. Make your edits to JSON files
2. Test locally: `python3 -m http.server 8000`
3. Commit and push to GitHub
4. Changes appear automatically on the website

### Troubleshooting
- **Page not loading**: Check browser console for errors
- **Images not showing**: Verify file exists in correct folder
- **JSON errors**: Use JSONLint.com to validate JSON syntax

## 📝 Notes
- Always test locally before pushing changes
- Keep image files small (< 1MB) for fast loading

---
---


## ✏️ How to Update Content

## Adding People
Edit `data/people.json`:

### Add Person Information
```json
{
  "name": "Student Name",
  "email": "email@kaist.ac.kr",
  "category": "phd",
  "major_phd": "Mechanical Engineering",
  "major_ms": "Mechanical Engineering",
  "role": "2025 Lab Leader (랩장)",
  "image": "filename.jpg",
  "researchInterests": ["Computer Vision", "Machine Learning"],
  "website": "https://personal-website.com"
}
```

### Add Person Image
Add image to `assets/images/people/`

### For current students:

add name to `members-current` list

### For alumni:

add more information about people
```json
{
  "category": "phd",
  "title": "Ph.D",
  "thesis_phd": "Thesis name",
  "nextPosition": "Assistant Professor at University",
  "graduationDate": "2024-08-31"
}
```

add name to `members-alumni` list

---

## Modify Faculty Information
Edit `data/faculty.json`:

### Modify Introduction
- change `intro` in `data/faculty.json`
- The `intro` should be **1 line**.
- You can use the basic HTML to format the text:
  - `<strong>...</strong>`
    - Make text **Bold** (useful for names, awards, venues).
  - `<i>...</i>`
    - Make text *italic* (useful for paper titles, special phrases).
  - `<br>`
    - Line break (new line, similar to pressing "Enter" once).
  - `<br><br>`
    - Double line break (extra spacing between paragraphs).
- For example, 
  ```html
  <strong>This is the example text.</strong> <i>This is the <strong>example</strong> text</i>. This is the example text.<br> This is the example text. This is the example text.<br><br> This is the example text. This is the example text. This is the example text.
  ```
  will be shown as

    <strong>This is the example text.</strong> <i>This is the <strong>example</strong> text</i>. This is the example text.<br> This is the example text. This is the example text.<br><br> This is the example text. This is the example text. This is the example text.



### Modify CV
- change CV file in `assets/docs`
- change `cv` in `data/faculty.json`

### Add Professional Experience
- add new information to `experience`
  ```json
  {
      "role": "Professor",
      "major": "Department of Mechanical Engineering",
      "org": "Korea Advanced Institute of Science and Technology (KAIST)",
      "period": "Mar. 2024 - Present",
      "details": [
          { "role": "Deputy Director of KAIST AI Institutes", "period": "Feb. 2025 - Present" },
          { "role": "Head of KAIST Robotics Program", "period": "Feb. 2023 - Jul. 2023" },
          { "role": "Affiliated with: Kim Jaechul Graduate School of AI, KAIST Institute for Robotics, Division of Future Vehicle" }
      ]
  }
  ```

### Add Corporate & Technical Advisories
- add new information to `advisory`
  ```json
  {
      "role": "External Advisory Committee",
      "org": "Samsung Electronics",
      "period": "Mar. 2022 - Mar. 2023"
  }
  ```

### Add Honors & Awards
- add new information to `awards`
  ```json
  { 
    "name": "<strong>Bronze Prize (as an Advisor)</strong>: Samsung HumanTech Paper Award", 
    "year": "2023" 
  }
  ```
- `<strong></strong>`: Bold
- `<i></i>`: Italic

### Add Professional & Public Service
- add new information to `service_professional_public`
  ```json
  { 
    "name": "<strong>Member</strong>, Special Committee for a Talent-Power Nation, Presidential Council on National Education Commission", 
    "period": "Nov. 2025 - May 2026"
  }
  ```
- `<strong></strong>`: Bold
- `<i></i>`: Italic

### Add Academic Service
- add new information to `service_academic`

This section contains **two major categories**:
- International
- Domestic

Each category holds a list of roles (e.g., Associate Editor, Area Chair, Organizer, etc.), and each role contains one or more organizations with optional service periods.

The structure is:
```json
"service_academic": {
  "International": [ ... ],
  "Domestic": [ ... ]
}
```

Each entry under `International` and `Domestic` foolows this format:
```json
{
  "role": "Role Name",
  "org": [
    {
      "name": "Organization or Conference Name",
      "period": "Service Period"
    }
  ]
}
```

#### If want to add new `org` in role
- add new `org` in target `role`

#### If want to add new `role`
- add new `role` and `org` in `International` or `Domestic` as follows:
  ```json
  {
    "role": "Role Name",
    "org": [
      {
        "name": "Organization or Conference Name",
        "period": "Service Period"
      }
    ]
  }
  ```

---

## Add Research
### Edit `data/research.json`
```json
{
  "id": "research_area",
  "title": "Research Area Name",
  "description": "Descriptions for title",
  "media": "images/research/title_image.jpg",
  "topics": [
    {
      "id": "topic1_id",
      "title": "Topic 1 Title",
      "description": "Descriptions for topic 1",
      "media": "images/research/topic_1.mp4"
    },
    {
      "id": "topic2_id",
      "title": "Topic 2 Title",
      "description": "Descriptions for topic 2",
      "media": "images/research/topic_2.gif"
    }
  ]
}
```

Add image/video files to `assets/images/research/` if needed

---

## Add Publication
### Edit `data/publications.json`
```json
{
  "title": "Your Paper Title",
  "authors": ["Author 1*", "Author 2*", "Author 3", "Kuk-Jin Yoon"],
  "venue": "ICCV",
  "year": 2025,
  "type": "conference",
  "status": "accepted",
  "keywords": ["End-to-End Driving", "3D Gaussian Splatting"],
  "pdf_url": "https://openaccess.thecvf.com/content/ICCV2025/papers/xxxx.pdf",
  "supp_url": "https://openaccess.thecvf.com/content/ICCV2025/supplemental/xxxx.pdf",
  "arxiv_url": "https://arxiv.org/abs/xxxx.xxxx",
  "code_url": "https://github.com/xxx/xxx",
  "project_url": "https://project_page.com"
}
```

---

## Add Projects
### Edit `data/projects.json`
```json
{
  "title": "Project Title",
  "category": "computer-vision",
  "status": "ongoing",
  "description": "descriptions",
  "funding": "Funding Organization",
  "organization": "Main Organization",
  "duration": "xx/20xx - xx/20xx",
  "role": "PI",
  "links": {}
}
```

---

## Adding News
### Edit `data/news.json`:
```json
{
  "id": "YYYY-keywords",
  "type": "TYPE",
  "date": "YYYY-MM-DD",
  "title": "News Title",
  "summary": "Short preview text.",
  "description": "Full article body using <strong>, <i>, <br>, <br><br> if needed.",
  "images": [
    {
      "src": "../../assets/images/news/PATH/TO/IMAGE.jpg",
      "alt": "Short image description"
    }
  ],
  "links": [
    {
      "label": "Link label",
      "url": "https://example.com"
    }
  ]
}
```
- images and links are optional.
- `type` includes `publication`, `admission`, `graduation`, `career`, `award`, `service`, `media`.
- Description should be in **1 line**. For the description, you can use basic HTML to format the text:
  - `<strong>...</strong>`
    - Make text **Bold** (useful for names, awards, venues).
  - `<i>...</i>`
    - Make text *italic* (useful for paper titles, special phrases).
  - `<br>`
    - Line break (new line, similar to pressing "Enter" once).
  - `<br><br>`
    - Double line break (extra spacing between paragraphs).

Make new dir and add image files to `assets/images/news/` if needed

### `type: "publication"`
Used for **conference/journal acceptance news**.
This news type automatically get the information from `publication.json`
```json
{
  "id": "2025-iccv",
  "type": "publication",
  "date": "2025-06-26",
  "title": "Papers accepted to ICCV 2025",
  "summary": "X papers from VILAB are accepted to ICCV 2025.",
  "venue": "ICCV 2025",
  "pub_venue": "ICCV",
  "pub_year": 2025
}
```

### `type: "admission"`
Used when **new students join the lab**.
This news type automatically get the information from `people.json`
```json
{
  "id": "2025-august-admission",
  "type": "admission",
  "date": "2025-08-28",
  "title": "New students joined VILAB (August 2025)",
  "summary": "We welcome new MS and Ph.D students to VILAB.",
  "description": "Welcome Messages...",
  "people": {
    "ms": [
      "Student Name 1",
      "Student Name 2"
    ],
    "phd": [
      "Student Name 3"
    ]
  }
}
```

### `type: "graduation"`
Used for **graduation news** (who graduated, which degree).
This news type automatically get the information from `people.json`
```json
{
  "id": "2025-february-graduation",
  "type": "graduation",
  "date": "2025-02-23",
  "title": "February 2025 Graduation",
  "summary": "Several members successfully completed their degrees.",
  "description": "Congratulation Messages...",
  "people": {
    "ms": [
      "MS Graduate 1",
      "MS Graduate 2"
    ],
    "phd": [
      "PhD Graduate 1",
      "PhD Graduate 2"
    ]
  }
}
```

### `type: "career"`
Used for **professor appointments, industry positions, etc**.
This news type automatically get the information from `people.json`
```json
{
  "id": "2025-february-professor-appointments",
  "type": "career",
  "date": "2025-02-23",
  "title": "Name1, Name2 Appointed as University Professors",
  "summary": "Several VILAB members have been appointed as university professors.",
  "description": "Conguraturation messages...",
  "people": [
    {
      "name": "Name 1",
      "career": "Assistant Professor at Department, University",
      "career_ko": "한글 직함/설명",
      "article_title": "Related article1 title",
      "article_url": "https://example.com/article1"
    },
    {
      "name": "Name 2",
      "career": "Assistant Professor at Department, University",
      "career_ko": "한글 직함/설명",
      "article_title": "Related article2 title",
      "article_url": "https://example.com/article2"
    }
  ]
}
```

### `type: "award"`
Used for **awards, prizes, competition results**.
```json
{
  "id": "20xx-award-id",
  "type": "award",
  "date": "2024-12-03",
  "title": "Award News Title",
  "summary": "award news summary.",
  "description": "Award news descriptions... This is the main sentences of news article.",
  "images": [
    {
      "src": "../../assets/images/news/PATH/TO/IMAGE1.png",
      "alt": "Short image1 description"
    },
    {
      "src": "../../assets/images/news/PATH/TO/IMAGE2.png",
      "alt": "Short image2 description"
    }
  ],
  "links": [
    {
      "label": "Article 1",
      "url": "https://www.article.com"
    },
    {
      "label": "Award Page 1",
      "url": "https://www.awardpage.com"
    }
  ]
}
```
- You can use `<strong>`, `<i>`, `<br>`, `<br><br>` for description.
- Recommand to add related `images` and `links` as Award Page or News article.

### `type: "service"`
Used for **appointments to roles such as Area Chair, Associate Editor, Organizer, Deputy Director, etc**.
```json
{
  "id": "20xx-roles-id",
  "type": "service",
  "date": "20xx-xx-xx",
  "title": "Professor Kuk-Jin Yoon Appointed as...",
  "summary": "Professor Kuk-Jin Yoon will serve as ...",
  "description": "Service news descriptions...",
  "links": [
    {
      "label": "Conference Name",
      "url": "https://conference.cc"
    }
  ]
}
```

### `type: "media"`
Used when the **lab's work appears in external media** (IEEE Spectrum, news articles, etc.).
```json
{
  "id": "20xx-ieee-spectrum",
  "type": "media",
  "date": "20xx-08-07",
  "title": "Our work on XYZ was introduced in ...",
  "summary": "Our work on XYZ was introduced in ...",
  "description": "Media news details...",
  "links": [
    {
      "label": "Article Label",
      "url": "https://spectrum.ieee.org/..."
    }
  ]
}
```

---

## Adding Gallery
### Edit `data/gallery.json`:
```json
{
  "title": "Event Title",
  "description": "Description of the photo",
  "category": "conferences",
  "date": "20xx-xx",
  "image_dir": "ImageDirName",
  "image_count": 14,
  "alt_text": "ICCV 2025",
  "featured": true,
  "tags": ["iccv", "conference"],
  "venue": "ICCV 2025",
  "location": "Hawaii, USA"
}
```
- category includes `lab-life` and `conferences`

### Make new Dir and add images for gallery
Make new directory `assets/images/gallery/new_dir/`

Add images to newly made directory.
- File names should be next templete
  - `DirName-Number.jpg`
  - Image file should be `jpg` file.


---
---

## 🖼️ Adding Images

### Profile Photos
- Add to: `assets/images/people/`
- Format: JPG or PNG
- Recommended size: Square, at least 300x300px
- Use filename only in JSON (e.g., `"photo.jpg"`)

### Research Images/Videos
- Add to: `assets/images/research/`
- File size should be lower than **100MB**.

### News Images
- Add to: `assets/images/news/`

### Gallery Photos
- Make new Dir in `assets/images/gallery/`
- Add images to: `assets/images/gallery/NewDir`
- every images filename should be `NewDir-Num.jpg`
- images should be `jpg` file.

## 📋 Categories Reference

### People Categories
- `postdoc`: Postdocs
- `phd`: PhD Students
- `ms`: Masters Students
- `undergraduate`: Undergraduate Students
- `interns`: Interns
- `visiting`: Visiting Researchers
- `staff`: Administrative Assistant

### News Types
- `publication`: Publiations
- `admission`: Admissions
- `graduation`: Graduations
- `career`: professor appointments, industry positions
- `award`: Awards
- `service`: Academic Service Appointment (roles such as Area Chair, Associate Editor, Organizer, Deputy Director)
- `media`: External Media

### Gallery Categories
- `lab-life`: Lab Life
- `conferences`: Conferences


