
const express = require("express");
const { getGalleryCollection } = require("./db");

const router = express.Router();

router.get("/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const gallery = await getGalleryCollection();

  const doc = await gallery.findOne({ fileName });
  if (!doc) {
    return res.redirect("/");
  }

  res.render("purchase", {
    title: "Purchase Painting",
    username: req.session.user.username,
    image: {
      fileName: doc.fileName,
      description: doc.description,
      price: doc.price
    }
  });
});

router.post("/:fileName", async (req, res) => {
  const fileName = req.params.fileName;
  const action = req.body.action;
  const gallery = await getGalleryCollection();

  if (action === "BUY") {
    await gallery.updateOne({ fileName }, { $set: { status: "S" } });
    return res.redirect("/?message=SOLD");
  }

  if (action === "CANCEL") {
    return res.redirect(
      `/?message=MAYBE+NEXT+TIME&selected=${encodeURIComponent(fileName)}`
    );
  }

  res.redirect("/");
});

module.exports = router;
