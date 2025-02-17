import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Hello its working");
});

export default router;