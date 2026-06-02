import os

files_to_update = [
    'src/components/GoogleLinkButton.jsx',
    'src/components/InstallButton.jsx',
    'src/components/Navbar.jsx'
]

wrong_id = 'UCzoylpvmDX_HoaBkgl4FTUQ'
correct_id = 'UCzoyIpvmDX_HoaBkgI4FTUQ'

for file in files_to_update:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(wrong_id, correct_id)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Channel ID updated to the correct one in all components")
