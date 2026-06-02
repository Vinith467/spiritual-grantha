import re

with open('src/pages/Music.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove DEVOTIONAL_TRACKS completely
content = re.sub(r'const DEVOTIONAL_TRACKS = \[.*?\]\n\n', '', content, flags=re.DOTALL)

# 2. Update fetch logic
fetch_old = '''          const combined = dbTracks.length > 0 ? dbTracks : DEVOTIONAL_TRACKS
          setTracks(combined)
          if (combined.length > 0) {
            setActiveTrack(combined[0])
          }
        } else {
          setTracks(DEVOTIONAL_TRACKS)
          setActiveTrack(DEVOTIONAL_TRACKS[0])
        }
      } catch (err) {
        console.error(err)
        setTracks(DEVOTIONAL_TRACKS)
        setActiveTrack(DEVOTIONAL_TRACKS[0])
      }'''

fetch_new = '''          setTracks(dbTracks)
          if (dbTracks.length > 0) {
            setActiveTrack(dbTracks[0])
          } else {
            setActiveTrack(null)
          }
        } else {
          setTracks([])
          setActiveTrack(null)
        }
      } catch (err) {
        console.error(err)
        setTracks([])
        setActiveTrack(null)
      }'''

content = content.replace(fetch_old, fetch_new)

# 3. Update the empty state render
empty_state_old = '''  if (!activeTrack) return null'''

empty_state_new = '''  if (!activeTrack) return (
    <div className="bg-[#141414] min-h-screen text-white pb-24 flex items-center justify-center">
      <Navbar />
      <div className="text-center p-8 space-y-4">
        <span className="text-4xl">🎵</span>
        <p className="font-bold text-gray-400">No Devotional Tracks Uploaded.</p>
        <p className="text-xs text-gray-600 max-w-xs mx-auto">Upload music using the Admin panel to populate this screen!</p>
      </div>
      <BottomNavbar />
    </div>
  )'''

content = content.replace(empty_state_old, empty_state_new)

with open('src/pages/Music.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored Music.jsx fallback data")
