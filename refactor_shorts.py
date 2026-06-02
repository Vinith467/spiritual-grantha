import re

with open('src/pages/Shorts.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace(
    "import { supabase } from '../lib/supabase'",
    "import { supabase } from '../lib/supabase'\nimport { useGoogleTranslate } from '../lib/useGoogleTranslate'"
)

# Add selectedLang
content = content.replace(
    "function Shorts() {",
    "function Shorts() {\n  const { selectedLang } = useGoogleTranslate()"
)

# Add eq filter
content = content.replace(
    ".select('*')\n          .order('created_at', { ascending: false })",
    ".select('*')\n          .eq('content_language', selectedLang)\n          .order('created_at', { ascending: false })"
)

# Update useEffect dependencies
content = content.replace(
    "  }, [])",
    "  }, [selectedLang])"
)

with open('src/pages/Shorts.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored Shorts.jsx")
