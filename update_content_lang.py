import os

files_to_update = ['src/pages/Home.jsx', 'src/pages/Music.jsx', 'src/pages/Shorts.jsx']

for file in files_to_update:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Destructure contentLang
    content = content.replace(
        "const { selectedLang } = useGoogleTranslate()",
        "const { selectedLang, contentLang } = useGoogleTranslate()"
    )
    
    # Use contentLang in queries
    content = content.replace(
        ".eq('content_language', selectedLang)",
        ".eq('content_language', contentLang)"
    )
    
    # Update dependency arrays
    content = content.replace(
        "  }, [selectedLang])",
        "  }, [contentLang])"
    )
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated contentLang usage in Home, Music, and Shorts")
