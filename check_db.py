import os
from supabase import create_client

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    # try to read from .env
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("VITE_SUPABASE_URL"):
                url = line.split("=")[1].strip().strip('"')
            elif line.startswith("VITE_SUPABASE_ANON_KEY"):
                key = line.split("=")[1].strip().strip('"')

supabase = create_client(url, key)

response = supabase.table("series").select("title, content_language").execute()
print(response.data)
