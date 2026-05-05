const LOG_API = "http://20.207.122.201/evaluation-service/logs";

async function Log(stack, level, pkg, message) {
  try {
    const logData = {
      stack: stack,
      level: level,
      package: pkg,
      message: message
    };

    await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(logData)
    });

  } catch (error) {
    console.error("Logging failed:", error);
  }
}

module.exports = Log;