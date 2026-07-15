# 🦾 CyberShield: Terminal-HUD Password Security Estimator

CyberShield is a lightweight, responsive, full-stack web application designed with a high-contrast, retro-futuristic Cyberpunk Terminal HUD aesthetic. It evaluates password strength in real-time using a hybrid security check system.

## 🚀 Key Features

* **Double-Layer Defense:** Instantly intercepts and rejects passwords matching a database of the top 10,000 most commonly leaked credentials.
* **Dynamic Complexity Audit:** Runs real-time regular expression checks analyzing password length, uppercase/lowercase letters, numbers, and special symbols.
* **Interactive Terminal UI:** Features an animated neon strength-indicator HUD, interactive system alert logs, and custom, actionable security recommendations.
* **Full-Stack Architecture:** Built with an elegant vanilla HTML/CSS frontend and powered by a fast, native Node.js backend.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (including CSS Variables, keyframe animations, and glowing HUD components), Vanilla ES6 JavaScript (DOM manipulation)
* **Backend:** Node.js, Express framework
* **Data Source:** `common_passwords.txt` (dictionary list of 10,000 top leaked passwords)
* **Original Data Source** https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10k-most-common.txt

---

## 💻 Local Installation & Setup

To run this application locally on your machine, follow these steps:

1. **Clone the repository**
   ```bash
 git clone [https://github.com/RiddhimanCode/password-estimator.git](https://github.com/RiddhimanCode/password-estimator.git
 
2. **Navigate into project directory**
cd password-estimator

3.**Install the required dependencies**
npm install

3.**Start the local Node.js development server**
node server.js

4.**Interact with the application**
Open your preferred web browser and navigate to:
http://localhost:3000
