# SEO Audit Tool

A simple web-based tool to analyze basic SEO elements of any webpage.

## Features

- Check and analyze:
  - Title tag
  - Meta description
  - H1 tags
  - Image alt attributes
- Calculate and display an overall SEO score
- Responsive design with dark/light mode toggle
- No backend required (uses JavaScript only)
- Optional Python backend available for advanced usage

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Optional Python backend using:
  - Flask
  - BeautifulSoup
  - Requests

## How It Works

The tool uses a CORS proxy (AllOrigins) to fetch webpage content and then analyzes the HTML structure to evaluate basic SEO elements.

### Frontend Only Version

The frontend-only version works directly in the browser without any backend server by using the AllOrigins proxy service to bypass CORS restrictions.

### With Backend (Optional)

The Python backend provides an alternative way to fetch and analyze web pages, which can be more reliable in some cases and provides additional opportunities for expansion.

## Getting Started

### Frontend Only

1. Simply open `index.html` in a web browser
2. Enter a URL to analyze
3. Click "Analyze" to see the results

### With Backend (Optional)

1. Install Python requirements:
   ```
   pip install flask flask-cors requests beautifulsoup4
   ```

2. Start the backend server:
   ```
   python backend.py
   ```

3. Open `index.html` in a web browser (or serve it with a simple HTTP server)

4. Update `script.js` to use the backend API instead of the CORS proxy:
   - Uncomment the backend API section in the code
   - Comment out the CORS proxy section

## Limitations

- The tool performs basic SEO checks only
- Some websites may block the CORS proxy or the requests from the backend
- The score is a simplified metric and not a comprehensive SEO evaluation

## Future Improvements

- Add more SEO checks (keywords, URL structure, mobile friendliness, etc.)
- Improve score calculation with weighted metrics
- Add PDF report generation
- Implement historical data comparison
- Add competitor analysis features

