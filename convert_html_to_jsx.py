import os
import re

SOURCE_DIR = r"c:\Users\ayush\Downloads\smart laundary system\smart laundary system\stitch_extracted\stitch_services_pricing"
DEST_DIR = r"c:\Users\ayush\Downloads\smart laundary system\smart laundary system\pristine_flow_app\src\components"

os.makedirs(DEST_DIR, exist_ok=True)

PAGES_TO_CONVERT = {
    "dynamic_dashboard_with_quotes_description": "CustomerHome",
    "admin_dashboard_1": "AdminDashboard",
    "customer_directory_premium_dark_mode": "CustomerNetwork",
    "services_pricing_premium_dark_mode": "Pricing",
    "staff_portal_2": "Machinery",
    "login_page_1": "Login"
}

def html_to_jsx(html):
    # Basic replacements
    jsx = html.replace('class="', 'className="')
    jsx = jsx.replace('<!--', '{/*').replace('-->', '*/}')
    
    # Self-closing tags
    jsx = re.sub(r'<input([^>]*?)>', r'<input\1 />', jsx)
    jsx = re.sub(r'<hr([^>]*?)>', r'<hr\1 />', jsx)
    # Be careful with imgs which might already be self closed.
    jsx = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1 />', jsx)
    
    # Simple style replacements (heuristic)
    def style_replacer(match):
        style_str = match.group(1)
        # Just rip out styles for now or convert simple ones
        return f'style={{{{}}}}' # empty style object to avoid parsing errors
    
    jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)
    
    # Replace `<style>` blocks with standard strings or just strip them
    jsx = re.sub(r'<style>[\s\S]*?</style>', '', jsx)
    
    # Fix reserved words
    jsx = jsx.replace('for="', 'htmlFor="')
    
    # Extract body content (strip <html>, <head>, <body> tags)
    body_match = re.search(r'<body[^>]*>([\s\S]*?)</body>', jsx, re.IGNORECASE)
    if body_match:
        jsx = body_match.group(1)
    
    # Wrap in fragments
    return f"""import React from 'react';

export default function COMPONENT_NAME() {{
  return (
    <>
      {jsx}
    </>
  );
}}
"""

for folder, comp_name in PAGES_TO_CONVERT.items():
    html_path = os.path.join(SOURCE_DIR, folder, "code.html")
    if os.path.exists(html_path):
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
            
        jsx_content = html_to_jsx(html_content)
        jsx_content = jsx_content.replace('COMPONENT_NAME', comp_name)
        
        # Link routing replacement for specific components
        # (This is manual, but replacing generic `#` with `/` helps slightly)
        
        with open(os.path.join(DEST_DIR, f"{comp_name}.jsx"), 'w', encoding='utf-8') as out:
            out.write(jsx_content)
        print(f"Generated {comp_name}.jsx")
    else:
        print(f"Missing {html_path}")
