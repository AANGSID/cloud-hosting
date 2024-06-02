const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Use multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.array('siteFiles'), (req, res) => {
  const siteName = req.body.siteName;
  const siteDir = path.join(__dirname, 'sites', siteName);

  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }

  req.files.forEach(file => {
    const dest = path.join(siteDir, file.originalname);
    fs.renameSync(file.path, dest);
  });

  res.json({ success: true });
});

app.get('/sites', (req, res) => {
  const sitesDir = path.join(__dirname, 'sites');
  const sites = fs.readdirSync(sitesDir);
  res.json({ sites: sites });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
app.post('/upload', upload.array('siteFiles'), (req, res) => {
    const siteName = req.body.siteName;
    console.log(`Hosting site: ${siteName}`);
    
    const siteDir = path.join(__dirname, 'sites', siteName);
  
    if (!fs.existsSync(siteDir)) {
      fs.mkdirSync(siteDir, { recursive: true });
      console.log(`Created directory: ${siteDir}`);
    }
  
    req.files.forEach(file => {
      const dest = path.join(siteDir, file.originalname);
      console.log(`Moving file: ${file.path} to ${dest}`);
      fs.renameSync(file.path, dest);
    });
  
    res.json({ success: true });
  });
  