import re

with open('src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace(
    "import { supabase } from '../lib/supabase'",
    "import { supabase } from '../lib/supabase'\nimport { useGoogleTranslate } from '../lib/useGoogleTranslate'"
)

# Add selectedLang
content = content.replace(
    "function Home() {",
    "function Home() {\n  const { selectedLang } = useGoogleTranslate()"
)

# Add eq filters
content = content.replace(
    ".select('*, episodes(*)')\n        .order('created_at', { ascending: false })",
    ".select('*, episodes(*)')\n        .eq('content_language', selectedLang)\n        .order('created_at', { ascending: false })"
)

content = content.replace(
    ".select('*')\n        .order('created_at', { ascending: false })",
    ".select('*')\n        .eq('content_language', selectedLang)\n        .order('created_at', { ascending: false })"
)

# Update useCallback dependencies
content = content.replace(
    "  }, [])",
    "  }, [selectedLang])"
)

with open('src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored Home.jsx")
