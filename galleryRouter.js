const express = require("express");
const { getGalleryCollection } = require("./db");

const router = express.Router();

const DEFAULT_IMAGE = "/images/Self%20Portrait.jpg";
const DEFAULT_LABEL = "Self Portrait";

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
  let selectedLabel = DEFAULT_LABEL;

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

  const requested = req.body?.imageChoice || null;

  if (!requested) {
    return res.render("gallery", {
      title: "Van Gogh Gallery",
      username: req.session.user.username,
      images,
      selectedImage: DEFAULT_IMAGE,
      selectedLabel: DEFAULT_LABEL,
      selectedFileName: null
    });
  }

  const found = docs.find((d) => d.fileName === requested);

  let selectedImage = DEFAULT_IMAGE;
  let selectedLabel = DEFAULT_LABEL;
  let selectedFileName = null;

  if (found) {
    selectedImage = `/images/${found.fileName}`;
    selectedLabel = filenameToLabel(found.fileName);
    selectedFileName = found.fileName;
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
