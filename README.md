# KAIST Visual Intelligence Lab Website

Internal guide for managing the lab website.

## 🚀 Quick Start

To test the website locally:
```bash
# Navigate to the project folder
cd kaist-vilab.github.io

# Start local server
python3 -m http.server 8000

# Open in browser
http://localhost:8000
```

## 📁 File Structure

```
├── index.html          # Homepage
├── pages/              # All pages
│   ├── people.html
│   ├── publications.html
│   ├── projects.html
│   ├── gallery.html
│   └── apply.html
├── data/               # Content (JSON files)
│   ├── people.json
│   ├── publications.json
│   ├── projects.json
│   ├── gallery.json
│   └── news.json
├── assets/
│   ├── images/
│   │   ├── people/     # Profile photos
│   │   ├── projects/   # Project images
│   │   └── gallery/    # Gallery photos
│   └── logos/
├── js/                 # JavaScript files
└── css/                # Styling
```

## ✏️ How to Update Content

### Adding News
Edit `data/news.json`:
```json
{
  "id": "news001",
  "date": "2025-09-05",
  "content": "New paper accepted at CVPR 2026!",
  "category": "publication",
  "featured": true
}
```

### Adding Publications
Edit `data/publications.json`:
```json
{
  "title": "Your Paper Title",
  "authors": ["Author 1", "Author 2", "Hyunjung Shim"],
  "venue": "CVPR",
  "year": 2025,
  "type": "conference",
  "status": "accepted",
  "category": "cv",
  "pdf_url": "https://arxiv.org/pdf/xxxx.pdf"
}
```

### Adding People
Edit `data/people.json`:

**For current students:**
```json
{
  "name": "Student Name",
  "email": "email@kaist.ac.kr",
  "category": "phd",
  "image": "filename.jpg",
  "researchInterests": ["Computer Vision", "Machine Learning"],
  "website": "https://personal-website.com"
}
```

**For alumni:**
```json
{
  "name": "Alumni Name",
  "category": "phd",
  "position": "alumni",
  "title": "PhD",
  "nextPosition": "Assistant Professor at University",
  "graduationDate": "2024-08-31"
}
```

### Adding Projects
Edit `data/projects.json`:
```json
{
  "title": "Project Name",
  "category": "generative-ai",
  "status": "ongoing",
  "description": "Brief description",
  "funding": "Funding Source",
  "duration": "2025.01 - 2026.12",
  "image": "project-image.png"
}
```

### Adding Gallery Items
Edit `data/gallery.json`:
```json
{
  "title": "Event Title",
  "description": "Description of the photo",
  "category": "lab-life",
  "date": "2025-09-05",
  "image": "photo.jpg",
  "featured": true,
  "tags": ["meeting", "research"]
}
```

## 🖼️ Adding Images

### Profile Photos
- Add to: `assets/images/people/`
- Format: JPG or PNG
- Recommended size: Square, at least 300x300px

### Project Images
- Add to: `assets/images/projects/`
- Use filename only in JSON (e.g., `"project.png"`)

### Gallery Photos
- Add to: `assets/images/gallery/`
- Use filename only in JSON (e.g., `"photo.jpg"`)

## 📋 Categories Reference

### Publication Categories
- `cv`: CV
- `ml`: ML
- `nlp`: NLP
- `medical_imaging`: Medical Imaging
- `multimodal`: Multi-Modal Learning

### People Categories
- `postdoc`: Postdocs
- `phd`: PhD Students
- `masters`: Masters Students
- `interns`: Interns
- `undergraduate`: Undergraduate Students

### Project Categories
- `generative-ai`: Generative AI
- `computer-vision`: Computer Vision
- `machine-learning`: Machine Learning
- `medical-imaging`: Medical Imaging

### Gallery Categories
- `lab-life`: Lab Life
- `conferences`: Conferences
- `events`: Events
- `research`: Research
- `awards`: Awards

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
- Use consistent naming for files (lowercase, no spaces)
