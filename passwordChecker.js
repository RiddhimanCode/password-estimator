const fs = require("fs");
const path = require("path");

/**
 * Checks the security of a password.
 * @param {string} password The password to check.
 * @returns {string} A JSON string containing status, score, and suggestions.
 */
function checkPassword(password) {
  if (typeof password !== "string") {
    return JSON.stringify(
      {
        status: "error",
        score: 0,
        suggestions: ["Password must be a string."],
      },
      null,
      2,
    );
  }

  // Load common_passwords.txt using the native Node.js filesystem module (fs)
  const filePath = path.join(__dirname, "common_passwords.txt");
  let commonPasswords = [];
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    // Split line-by-line, filtering out empty lines and trimming whitespace
    commonPasswords = fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (error) {
    return JSON.stringify(
      {
        status: "error",
        score: 0,
        suggestions: ["Could not load common passwords list: " + error.message],
      },
      null,
      2,
    );
  }

  // Check if the user's password is in the list
  if (commonPasswords.includes(password)) {
    return JSON.stringify(
      {
        status: "rejected",
        score: 0,
        suggestions: [
          "Password is too common. Please choose a more unique password.",
        ],
      },
      null,
      2,
    );
  }

  // Regular expressions to check complexity requirements
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialSymbol: /[^A-Za-z0-9]/.test(password),
  };

  // Calculate score and assemble suggestions
  let score = 0;
  const suggestions = [];

  if (checks.length) {
    score++;
  } else {
    suggestions.push("Make the password at least 8 characters long.");
  }

  if (checks.uppercase) {
    score++;
  } else {
    suggestions.push("Add at least one uppercase letter.");
  }

  if (checks.lowercase) {
    score++;
  } else {
    suggestions.push("Add at least one lowercase letter.");
  }

  if (checks.number) {
    score++;
  } else {
    suggestions.push("Add at least one number.");
  }

  if (checks.specialSymbol) {
    score++;
  } else {
    suggestions.push(
      "Add at least one special character (e.g. !, @, #, $, etc.).",
    );
  }

  // Determine status based on score
  let status = "weak";
  if (score === 5) {
    status = "strong";
  } else if (score >= 3) {
    status = "medium";
  }

  return JSON.stringify(
    {
      status: status,
      score: score,
      suggestions: suggestions,
    },
    null,
    2,
  );
}

// Export for module usage
module.exports = { checkPassword };

// Run directly from command line if executed as `node passwordChecker.js <password>`
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(
      JSON.stringify(
        {
          status: "error",
          score: 0,
          suggestions: [
            "Please provide a password as a command line argument. Example: node passwordChecker.js myPassword123!",
          ],
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }
  const password = args.join(" "); // Allow passwords with spaces if they are not quoted
  console.log(checkPassword(password));
}
