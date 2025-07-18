// SEO Audit Tool JavaScript
document.addEventListener("DOMContentLoaded", () => {
    const auditForm = document.getElementById("audit-form");
    const urlInput = document.getElementById("url-input");
    const loadingIndicator = document.getElementById("loading");
    const resultsSection = document.getElementById("results");
    const scoreValue = document.querySelector(".score-value");
    
    // SEO check result elements
    const titleResult = document.getElementById("title-result");
    const metaDescriptionResult = document.getElementById("meta-description-result");
    const h1Result = document.getElementById("h1-result");
    const imgAltResult = document.getElementById("img-alt-result");
    
    auditForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Get the URL to analyze
        const url = urlInput.value.trim();
        
        // Basic validation
        if (!url || !isValidURL(url)) {
            alert("Please enter a valid URL including http:// or https://");
            return;
        }
        
        // Show loading indicator, hide results
        loadingIndicator.classList.remove("hidden");
        resultsSection.classList.add("hidden");
        
        try {
            // Use a proxy to bypass CORS issues
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error("Failed to fetch URL content");
            }
            
            const data = await response.json();
            
            if (!data.contents) {
                throw new Error("Failed to get page contents");
            }
            
            // Parse the HTML content
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, "text/html");
            
            // Run SEO checks
            const seoResults = {
                title: checkTitle(doc),
                metaDescription: checkMetaDescription(doc),
                h1Tags: checkH1Tags(doc),
                imgAltTags: checkImgAltTags(doc)
            };
            
            // Display results
            displayResults(seoResults);
            
            // Calculate and display score
            const score = calculateScore(seoResults);
            scoreValue.textContent = score;
            
            // Show results section
            resultsSection.classList.remove("hidden");
        } catch (error) {
            console.error("Error during SEO analysis:", error);
            alert(`Error analyzing the URL: ${error.message}`);
        } finally {
            // Hide loading indicator
            loadingIndicator.classList.add("hidden");
        }
    });
    
    // Validate URL format
    function isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Check title tag
    function checkTitle(doc) {
        const titleElement = doc.querySelector("title");
        const titleText = titleElement ? titleElement.textContent.trim() : "";
        
        let status, message;
        
        if (!titleText) {
            status = "bad";
            message = "Missing title tag";
        } else if (titleText.length < 10) {
            status = "warning";
            message = "Title is too short (less than 10 characters)";
        } else if (titleText.length > 60) {
            status = "warning";
            message = "Title is too long (more than 60 characters)";
        } else {
            status = "good";
            message = "Title length is good";
        }
        
        return {
            content: titleText,
            status,
            message
        };
    }
    
    // Check meta description
    function checkMetaDescription(doc) {
        const metaDescElement = doc.querySelector("meta[name=\"description\"]");
        const metaDescContent = metaDescElement ? metaDescElement.getAttribute("content").trim() : "";
        
        let status, message;
        
        if (!metaDescContent) {
            status = "bad";
            message = "Missing meta description";
        } else if (metaDescContent.length < 50) {
            status = "warning";
            message = "Meta description is too short (less than 50 characters)";
        } else if (metaDescContent.length > 160) {
            status = "warning";
            message = "Meta description is too long (more than 160 characters)";
        } else {
            status = "good";
            message = "Meta description length is good";
        }
        
        return {
            content: metaDescContent,
            status,
            message
        };
    }
    
    // Check H1 tags
    function checkH1Tags(doc) {
        const h1Elements = doc.querySelectorAll("h1");
        const h1Count = h1Elements.length;
        const h1Texts = Array.from(h1Elements).map(el => el.textContent.trim());
        
        let status, message;
        
        if (h1Count === 0) {
            status = "bad";
            message = "No H1 tag found";
        } else if (h1Count === 1) {
            status = "good";
            message = "One H1 tag found (recommended)";
        } else {
            status = "warning";
            message = `Multiple H1 tags found (${h1Count}). Consider using only one.`;
        }
        
        return {
            content: h1Texts.join(", ") || "None",
            count: h1Count,
            status,
            message
        };
    }
    
    // Check image alt tags
    function checkImgAltTags(doc) {
        const imgElements = doc.querySelectorAll("img");
        const imgCount = imgElements.length;
        
        if (imgCount === 0) {
            return {
                content: "No images found on page",
                count: 0,
                missingAlt: 0,
                status: "good",
                message: "No images to check"
            };
        }
        
        let missingAlt = 0;
        const imgsWithoutAlt = [];
        
        imgElements.forEach(img => {
            const src = img.getAttribute("src") || "";
            const alt = img.getAttribute("alt");
            
            if (!alt && !src.includes("data:image")) {
                missingAlt++;
                imgsWithoutAlt.push(src);
            }
        });
        
        let status, message;
        
        if (missingAlt === 0) {
            status = "good";
            message = "All images have alt attributes";
        } else if (missingAlt < imgCount / 2) {
            status = "warning";
            message = `${missingAlt} out of ${imgCount} images are missing alt attributes`;
        } else {
            status = "bad";
            message = `${missingAlt} out of ${imgCount} images are missing alt attributes`;
        }
        
        return {
            content: `${imgCount - missingAlt} out of ${imgCount} images have alt tags`,
            count: imgCount,
            missingAlt,
            status,
            message
        };
    }
    
    // Display SEO check results
    function displayResults(results) {
        // Display title result
        displayResult(titleResult, "Title Tag", results.title);
        
        // Display meta description result
        displayResult(metaDescriptionResult, "Meta Description", results.metaDescription);
        
        // Display H1 result
        displayResult(h1Result, "H1 Tags", results.h1Tags);
        
        // Display image alt tags result
        displayResult(imgAltResult, "Image Alt Tags", results.imgAltTags);
    }
    
    // Helper function to display a single result
    function displayResult(element, title, result) {
        const contentDiv = element.querySelector(".result-content");
        const statusDiv = element.querySelector(".result-status");
        
        contentDiv.textContent = result.content;
        statusDiv.textContent = result.message;
        
        // Reset classes
        statusDiv.classList.remove("status-good", "status-warning", "status-bad");
        element.classList.remove("border-good", "border-warning", "border-bad");
        
        // Add appropriate status class
        statusDiv.classList.add(`status-${result.status}`);
        element.style.borderLeftColor = result.status === "good" ? "#28a745" : 
                                       result.status === "warning" ? "#ffc107" : "#dc3545";
    }
    
    // Calculate overall SEO score
    function calculateScore(results) {
        let score = 0;
        const checks = [results.title, results.metaDescription, results.h1Tags, results.imgAltTags];
        
        checks.forEach(check => {
            if (check.status === "good") score += 25;
            else if (check.status === "warning") score += 12.5;
        });
        
        return Math.round(score);
    }
    
    // Add theme toggle functionality
    const header = document.querySelector(".container header");
    const themeToggle = document.createElement("button");
    themeToggle.id = "theme-toggle";
    themeToggle.title = "Toggle Dark/Light Mode";
    themeToggle.innerHTML = "🌙";
    themeToggle.classList.add("theme-toggle-btn");
    header.appendChild(themeToggle);
    
    // Add CSS for the theme toggle button
    const style = document.createElement("style");
    style.textContent = `
        .theme-toggle-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: white;
            padding: 5px;
            border-radius: 50%;
            transition: transform 0.3s;
        }
        
        .theme-toggle-btn:hover {
            transform: scale(1.1);
        }
        
        /* Dark theme styles */
        body.dark-theme {
            background-color: #222;
            color: #eee;
        }
        
        body.dark-theme .container {
            background-color: #333;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        body.dark-theme header {
            background-color: #1e3a8a;
        }
        
        body.dark-theme #url-input {
            background-color: #444;
            color: #eee;
            border-color: #555;
        }
        
        body.dark-theme .result-card {
            background-color: #3a3a3a;
        }
        
        body.dark-theme #seo-score {
            background-color: #3a3a3a;
        }
        
        body.dark-theme footer {
            background-color: #2a2a2a;
            border-top-color: #444;
        }
    `;
    document.head.appendChild(style);
    
    // Theme toggle functionality
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        themeToggle.innerHTML = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
    });
});
