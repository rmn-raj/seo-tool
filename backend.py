#!/usr/bin/env python3
"""
SEO Audit Tool - Backend Server
This script provides a backend API to fetch and analyze web pages for SEO metrics.
"""

import json
import re
import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/analyze', methods=['POST'])
def analyze_url():
    """Analyze the given URL for SEO metrics"""
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
    
    url = data['url']
    
    try:
        # Fetch the webpage
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract and analyze SEO elements
        results = {
            'title': check_title(soup),
            'meta_description': check_meta_description(soup),
            'h1_tags': check_h1_tags(soup),
            'img_alt_tags': check_img_alt_tags(soup),
            'score': 0  # Will be calculated
        }
        
        # Calculate overall score
        results['score'] = calculate_score(results)
        
        return jsonify(results)
    
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch URL: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Error analyzing URL: {str(e)}'}), 500

def check_title(soup):
    """Check title tag"""
    title_tag = soup.find('title')
    title_text = title_tag.get_text().strip() if title_tag else ''
    
    result = {
        'content': title_text,
        'status': 'bad',
        'message': 'Missing title tag'
    }
    
    if title_text:
        if len(title_text) < 10:
            result['status'] = 'warning'
            result['message'] = 'Title is too short (less than 10 characters)'
        elif len(title_text) > 60:
            result['status'] = 'warning'
            result['message'] = 'Title is too long (more than 60 characters)'
        else:
            result['status'] = 'good'
            result['message'] = 'Title length is good'
    
    return result

def check_meta_description(soup):
    """Check meta description"""
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    meta_content = meta_desc.get('content', '').strip() if meta_desc else ''
    
    result = {
        'content': meta_content,
        'status': 'bad',
        'message': 'Missing meta description'
    }
    
    if meta_content:
        if len(meta_content) < 50:
            result['status'] = 'warning'
            result['message'] = 'Meta description is too short (less than 50 characters)'
        elif len(meta_content) > 160:
            result['status'] = 'warning'
            result['message'] = 'Meta description is too long (more than 160 characters)'
        else:
            result['status'] = 'good'
            result['message'] = 'Meta description length is good'
    
    return result

def check_h1_tags(soup):
    """Check H1 tags"""
    h1_elements = soup.find_all('h1')
    h1_count = len(h1_elements)
    h1_texts = [h1.get_text().strip() for h1 in h1_elements]
    
    result = {
        'content': ', '.join(h1_texts) if h1_texts else 'None',
        'count': h1_count,
        'status': 'bad',
        'message': 'No H1 tag found'
    }
    
    if h1_count == 1:
        result['status'] = 'good'
        result['message'] = 'One H1 tag found (recommended)'
    elif h1_count > 1:
        result['status'] = 'warning'
        result['message'] = f'Multiple H1 tags found ({h1_count}). Consider using only one.'
    
    return result

def check_img_alt_tags(soup):
    """Check image alt tags"""
    img_elements = soup.find_all('img')
    img_count = len(img_elements)
    
    result = {
        'content': 'No images found on page',
        'count': 0,
        'missing_alt': 0,
        'status': 'good',
        'message': 'No images to check'
    }
    
    if img_count > 0:
        missing_alt = 0
        imgs_without_alt = []
        
        for img in img_elements:
            src = img.get('src', '')
            alt = img.get('alt')
            
            # Skip data URIs and empty sources
            if not alt and src and not src.startswith('data:image'):
                missing_alt += 1
                imgs_without_alt.append(src)
        
        if missing_alt == 0:
            status = 'good'
            message = 'All images have alt attributes'
        elif missing_alt < img_count / 2:
            status = 'warning'
            message = f'{missing_alt} out of {img_count} images are missing alt attributes'
        else:
            status = 'bad'
            message = f'{missing_alt} out of {img_count} images are missing alt attributes'
        
        result = {
            'content': f'{img_count - missing_alt} out of {img_count} images have alt tags',
            'count': img_count,
            'missing_alt': missing_alt,
            'status': status,
            'message': message
        }
    
    return result

def calculate_score(results):
    """Calculate overall SEO score"""
    score = 0
    checks = [
        results['title'],
        results['meta_description'],
        results['h1_tags'],
        results['img_alt_tags']
    ]
    
    for check in checks:
        if check['status'] == 'good':
            score += 25
        elif check['status'] == 'warning':
            score += 12.5
    
    return round(score)

if __name__ == '__main__':
    app.run(debug=True, port=5000)