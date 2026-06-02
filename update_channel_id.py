import os

files_to_update = [
    'src/components/GoogleLinkButton.jsx',
    'src/components/InstallButton.jsx',
    'src/components/Navbar.jsx'
]

old_id = 'UCYcsHqcXqkYV0qNWa4L9xPg'
new_id = 'UCzoylpvmDX_HoaBkgl4FTUQ'

for file in files_to_update:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(old_id, new_id)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Channel ID updated in all components")
