const validateApiFlowRequest = (req, res, next) => {
  const { selectedFiles } = req.body || {};
  if (!Array.isArray(selectedFiles) || selectedFiles.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one selected file.",
    });
  }
  const invalidFile = selectedFiles.find(
    (file) =>
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string",
  );
  if (invalidFile) {
    return res.status(400).json({
        success: false,
        message: "Each file must contain a valid path and content.",
    })
  }
  next()
};

export {validateApiFlowRequest};