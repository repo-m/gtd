import os
import re

# This script scans a specified directory and its subdirectories to find Markdown files (.md) 
# that do not contain any of the specified hashtags
# It prints the paths of these files to the console
# Note: The script uses regular expressions to match hashtags, so you can customize the patterns as needed

def file_contains_hashtag(file_path, hashtags):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            for hashtag in hashtags:
                if re.search(hashtag, content):
                    return True
    except Exception as e:
        pass
    return False

def find_files_without_hashtags(directory, hashtags):
    try:
        contents = os.listdir(directory)
    except Exception as e:
        return

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                if not file_contains_hashtag(file_path, hashtags):
                    print(f"File without hashtags: {file_path}")

hashtags = [
    r'#fleeting', r'#source', r'permanent', r'#index', r"#structure",
    r"#system", r"#list", r"", r"#archive"
]

directory = '/Users/hm13/m/reference/journal/'  # Replace with the path to your workspace

find_files_without_hashtags(directory, hashtags)