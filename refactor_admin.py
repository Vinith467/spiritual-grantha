import re

with open('src/pages/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update form initial states
content = content.replace(
    "const [bannerForm, setBannerForm] = useState({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '' })",
    "const [bannerForm, setBannerForm] = useState({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '', content_language: 'en' })"
)
content = content.replace(
    "const [seriesForm, setSeriesForm] = useState({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '' })",
    "const [seriesForm, setSeriesForm] = useState({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '', content_language: 'en' })"
)
content = content.replace(
    "const [episodeForm, setEpisodeForm] = useState({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '' })",
    "const [episodeForm, setEpisodeForm] = useState({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '', content_language: 'en' })"
)
content = content.replace(
    "const [musicForm, setMusicForm] = useState({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional' })",
    "const [musicForm, setMusicForm] = useState({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional', content_language: 'en' })"
)
content = content.replace(
    "const [shortForm, setShortForm] = useState({ title: 'Divine Short', description: '', youtubeId: '' })",
    "const [shortForm, setShortForm] = useState({ title: 'Divine Short', description: '', youtubeId: '', content_language: 'en' })"
)

# 2. Update payloads
# Banners
content = content.replace(
    "desktop_url: bannerForm.desktopUrl\n    }",
    "desktop_url: bannerForm.desktopUrl,\n      content_language: bannerForm.content_language\n    }"
)
content = content.replace(
    "setBannerForm({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '' })",
    "setBannerForm({ title: '', description: '', targetId: '', mobileUrl: '', desktopUrl: '', content_language: 'en' })"
)
content = content.replace(
    "desktopUrl: item.desktop_url || ''\n    })",
    "desktopUrl: item.desktop_url || '',\n      content_language: item.content_language || 'en'\n    })"
)

# Series
content = content.replace(
    "desktop_thumbnail_url: seriesForm.desktop_thumbnail_url\n    }",
    "desktop_thumbnail_url: seriesForm.desktop_thumbnail_url,\n      content_language: seriesForm.content_language\n    }"
)
content = content.replace(
    "setSeriesForm({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '' })",
    "setSeriesForm({ title: '', thumbnail_url: '', desktop_thumbnail_url: '', description: '', content_language: 'en' })"
)
content = content.replace(
    "desktop_thumbnail_url: item.desktop_thumbnail_url || ''\n    })",
    "desktop_thumbnail_url: item.desktop_thumbnail_url || '',\n      content_language: item.content_language || 'en'\n    })"
)

# Episodes
content = content.replace(
    "description: episodeForm.description\n    }",
    "description: episodeForm.description,\n      content_language: episodeForm.content_language\n    }"
)
content = content.replace(
    "setEpisodeForm({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '' })",
    "setEpisodeForm({ series_id: '', title: '', youtube_id: '', thumbnail_url: '', episode_number: '', description: '', content_language: 'en' })"
)
content = content.replace(
    "description: item.description || ''\n    })",
    "description: item.description || '',\n      content_language: item.content_language || 'en'\n    })"
)

# Music
content = content.replace(
    "category: musicForm.category\n    }",
    "category: musicForm.category,\n      content_language: musicForm.content_language\n    }"
)
content = content.replace(
    "setMusicForm({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional' })",
    "setMusicForm({ trackTitle: '', artist: '', youtubeId: '', coverUrl: '', category: 'Devotional', content_language: 'en' })"
)
content = content.replace(
    "category: item.category || 'Devotional'\n    })",
    "category: item.category || 'Devotional',\n      content_language: item.content_language || 'en'\n    })"
)

# Shorts
content = content.replace(
    "youtube_id: shortForm.youtubeId\n    }",
    "youtube_id: shortForm.youtubeId,\n      content_language: shortForm.content_language\n    }"
)
content = content.replace(
    "setShortForm({ title: 'Divine Short', description: '', youtubeId: '' })",
    "setShortForm({ title: 'Divine Short', description: '', youtubeId: '', content_language: 'en' })"
)
content = content.replace(
    "youtubeId: item.youtube_id || ''\n    })",
    "youtubeId: item.youtube_id || '',\n      content_language: item.content_language || 'en'\n    })"
)


# 3. Add Language Dropdown to forms
dropdown_html = '''<div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-400">Content Language</label>
                      <select value={{VAL}} onChange={e => {ONCHANGE}} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF9933]/50 outline-none text-white [&>option]:bg-[#141414] [&>option]:text-white">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="kn">Kannada</option>
                      </select>
                    </div>'''

# Episode form
ep_dropdown = dropdown_html.replace('{VAL}', 'episodeForm.content_language').replace('{ONCHANGE}', "setEpisodeForm({ ...episodeForm, content_language: e.target.value })")
content = content.replace(
    '<input required type="text" placeholder="Episode Title"',
    f"{ep_dropdown}\n                    <input required type=\"text\" placeholder=\"Episode Title\""
)

# Series form
series_dropdown = dropdown_html.replace('{VAL}', 'seriesForm.content_language').replace('{ONCHANGE}', "setSeriesForm({ ...seriesForm, content_language: e.target.value })")
content = content.replace(
    '<input required type="text" placeholder="Series/Show Title"',
    f"{series_dropdown}\n                    <input required type=\"text\" placeholder=\"Series/Show Title\""
)

# Music form
music_dropdown = dropdown_html.replace('{VAL}', 'musicForm.content_language').replace('{ONCHANGE}', "setMusicForm({ ...musicForm, content_language: e.target.value })")
content = content.replace(
    '<input required type="text" placeholder="Track Title"',
    f"{music_dropdown}\n                <input required type=\"text\" placeholder=\"Track Title\""
)

# Shorts form
short_dropdown = dropdown_html.replace('{VAL}', 'shortForm.content_language').replace('{ONCHANGE}', "setShortForm({ ...shortForm, content_language: e.target.value })")
content = content.replace(
    '<input required type="text" placeholder="Shorts Title"',
    f"{short_dropdown}\n                <input required type=\"text\" placeholder=\"Shorts Title\""
)

# Write back
with open('src/pages/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored Admin.jsx")
