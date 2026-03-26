const express = require("express");
const { getGalleryCollection } = require("./db");

const router = express.Router();

const DEFAULT_IMAGE = "/images/Self Portrait.jpg";

function filenameToLabel(fileName) {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return fileName;
  return fileName.substring(0, dotIndex);
}

router.get("/", async (req, res) => {
  const gallery = await getGalleryCollection();

  const docs = await gallery.find({ status: "A" }).toArray();

  const images = docs.map((doc) => ({
    fileName: doc.fileName,
    label: filenameToLabel(doc.fileName)
  }));

  const selectedFileName = req.query.selected || null;
  const message = req.query.message || null;

  let selectedImage = DEFAULT_IMAGE;
  let selectedLabel = filenameToLabel("Self Portrait.jpg");

  if (selectedFileName) {
    const found = docs.find((d) => d.fileName === selectedFileName);
    if (found) {
      selectedImage = `/images/${found.fileName}`;
      selectedLabel = filenameToLabel(found.fileName);
    }
  }

  res.render("gallery", {
    title: "Van Gogh Gallery",
    username: req.session.user.username,
    images,
    selectedImage,
    selectedLabel,
    selectedFileName,
    message
  });
});

router.post("/display", async (req, res) => {
  const gallery = await getGalleryCollection();
  const docs = await gallery.find({ status: "A" }).toArray();

  const images = docs.map((doc) => ({
    fileName: doc.fileName,
    label: filenameToLabel(doc.fileName)
  }));

  const requested = req.body.imageChoice;

  let selectedImage = DEFAULT_IMAGE;
  let selectedLabel = filenameToLabel("Self Portrait.jpg");
  let selectedFileName = null;

  if (requested) {
    const found = docs.find((d) => d.fileName === requested);
    if (found) {
      selectedImage = `/images/${found.fileName}`;
      selectedLabel = filenameToLabel(found.fileName);
      selectedFileName = found.fileName;
    }
  }

  res.render("gallery", {
    title: "Van Gogh Gallery",
    username: req.session.user.username,
    images,
    selectedImage,
    selectedLabel,
    selectedFileName
  });
});

module.exports = router;
