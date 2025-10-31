import re
import os
from pathlib import Path

def generate_booth_html_files_from_file(data_filepath_from_script=""):
    """
    Reads booth data from a specified file, parses it, and generates HTML files,
    placing them in the /public/booths/ directory relative to the project root.
    """
    
    # --- 1. Define Paths Relative to the Project Root ---
    
    # Get the directory where the current script (BoothHtmlGen.py) resides: /src/util/
    script_dir = Path(__file__).resolve().parent
    
    # The Project Root is two levels up from the script_dir: /src/util/ -> /
    project_root = script_dir.parent.parent
    
    # Input File Path: project_root / public / all_booths.txt
    # This calculation is robust regardless of where the script is executed from.
    input_file_path = project_root / "public" / "all_booths.txt"
    
    # Output Directory Path: project_root / public / booths /
    output_dir = project_root / "public" / "booths"
    
    # Ensure the output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📄 Attempting to read data from: {input_file_path}")
    print(f"📦 Outputting files to: {output_dir}")

    # --- 2. File Reading ---
    try:
        if not input_file_path.exists():
            raise FileNotFoundError(f"File not found at: {input_file_path}")
            
        with open(input_file_path, 'r', encoding='utf-8') as f:
            booth_data_text = f.read()
    except FileNotFoundError as e:
        print(f"🛑 Error: {e}")
        print("Please ensure 'all_booths.txt' is correctly placed in the '/public/' folder.")
        return
    except Exception as e:
        print(f"🛑 Error reading file: {e}")
        return

    # --- 3. HTML Template and Regex (omitted for brevity, remains the same) ---
    HTML_TEMPLATE = """<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{id} - {name}</title>
    <style>
        body {{ font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; }}
        h1 {{ color: #007bff; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0; }}
        .description {{ background: #edf4f7; border-radius: 8px; padding: 1.5rem; margin-top: 20px; }}
        .content-section p {{ margin: 0.5rem 0; }}
        .activity-header {{ font-weight: bold; color: #28a745; margin-top: 1rem; }}
        .tip {{ margin-top: 1rem; padding: 0.5rem 1rem; border-left: 4px solid #ffc107; background-color: #fff9e6; }}
    </style>
</head>
<body>
    <div class="description">
        <div class="content-section">
            {content}
        </div>
    </div>
</body>
</html>
"""
    BOOTH_PATTERN = re.compile(r'<start>\s*id: \"(.*?)\"\s*name: \"(.*?)\"\s*description: (.*?)<end>', re.DOTALL)

    matches = BOOTH_PATTERN.findall(booth_data_text)

    if not matches:
        print("🔍 No booth data found in the file.")
        return

    # URL pattern to detect URLs in the content
    URL_PATTERN = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
    # Pattern to detect <line> tags
    LINE_PATTERN = re.compile(r'<line>(.*?)</line>')

    def wrap_urls_in_links(text):
        """Convert URLs in text to HTML links"""
        def replacer(match):
            url = match.group(0)
            # Add https:// if the URL starts with www.
            if url.startswith('www.'):
                url = 'https://' + url
            return f'<a href="{url}" target="_blank">{url}</a>'
        return URL_PATTERN.sub(replacer, text)

    def process_line(line):
        """Process a single line, handling both URLs and <line> tags"""
        # Check if this is a <line> tag
        line_match = LINE_PATTERN.match(line.strip())
        if line_match:
            # If there's content inside the <line> tag, wrap it in a paragraph above the line
            content = line_match.group(1).strip()
            if content:
                return f"<p>{wrap_urls_in_links(content)}</p>\n<hr>"
            return "<hr>"
        # Regular line, process URLs and wrap in paragraph
        return f"<p>{wrap_urls_in_links(line)}</p>"

    # --- 4. Process and Write Files ---
    for booth_id, booth_name, raw_content in matches:
        print(f"✨ Processing booth: **{booth_id}** - {booth_name}")

        lines = [line.strip() for line in raw_content.strip().split('\n') if line.strip()]
        # Process each line, handling both URLs and <line> tags
        html_content_parts = [process_line(line) for line in lines]
        html_content = "\n".join(html_content_parts)

        final_html = HTML_TEMPLATE.format(
            id=booth_id,
            name=booth_name,
            content=html_content
        )

        # Output path is the new dedicated directory
        filename = output_dir / f"{booth_id}.html"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(final_html)
            print(f"✅ Generated {filename.name}")
        except IOError as e:
            print(f"❌ Error writing file {filename.name}: {e}")

# --- 5. Execution ---
if __name__ == "__main__":
    generate_booth_html_files_from_file()