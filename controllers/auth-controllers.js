const registerControllers = async (req, res) => {
  console.log("user register");
  res.status(200).json({
    success: true,
    message: "test checked",
  });
};

export { registerControllers };
