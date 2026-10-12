const express = require("express");
const router = express.Router();
const { enqueueUserOp } = require("../controllers/entrypoint.controller");

router.post("/", enqueueUserOp);

module.exports = router;
