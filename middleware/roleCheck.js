module.exports = function (role) {
  return (req, res, next) => {
    if (role !== req.user.role) {
      return res
        .status(403)
        .json({ msg: "Access denied: insufficient permissions" });
    }

    next();
  };
};
