const chatService = require("./chat.service");

async function getMessages(req, res) {
  try {
    const { studentPhone } = req.params;
    const messages = await chatService.getMessages(studentPhone);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getMessages,
};
