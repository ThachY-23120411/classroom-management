const authService = require("./auth.service");

async function createAccessCode(req, res) {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "phoneNumber is required",
      });
    }

    const result = await authService.createAccessCode(phoneNumber);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function validateAccessCode(req, res) {
  try {
    const { phoneNumber, accessCode } = req.body;

    if (!phoneNumber || !accessCode) {
      return res.status(400).json({
        success: false,
        message: "phoneNumber and accessCode are required",
      });
    }

    const user = await authService.validateAccessCode(phoneNumber, accessCode);

    res.json({
      success: true,
      data: {
        user,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function loginEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    const result = await authService.loginEmail(email);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function validateEmailAccessCode(req, res) {
  try {
    const { email, accessCode } = req.body;

    if (!email || !accessCode) {
      return res.status(400).json({
        success: false,
        message: "email and accessCode are required",
      });
    }

    const result = await authService.validateEmailAccessCode({
      email,
      accessCode,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createAccessCode,
  validateAccessCode,
  loginEmail,
  validateEmailAccessCode,
};
