import html, json, re, urllib.request, os
jobs = [
    ('post-DbxZC3gjK5Q', 'https://www.instagram.com/p/DbxZC3gjK5Q/'),
    ('reel-DaPiCXGsRyA', 'https://www.instagram.com/reel/DaPiCXGsRyA/'),
    ('reel-DcloThSsY45', 'https://www.instagram.com/reel/DcloThSsY45/'),
    ('reel-DbxLYZ7MnZt', 'https://www.instagram.com/reel/DbxLYZ7MnZt/'),
    ('reel-DcgjUrMMWu3', 'https://www.instagram.com/reel/DcgjUrMMWu3/'),
]
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'}
os.makedirs('assets', exist_ok=True)
for name, link in jobs:
    print('==', name, flush=True)
    try:
        req = urllib.request.Request(link, headers=UA)
        page = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
        m = re.search(r'<meta\b(?=[^>]*\bproperty=["\']og:image["\'])(?=[^>]*\bcontent=["\']([^"\']+))[^>]*>', page, re.I)
        if not m:
            print('NO_MATCH'); continue
        clean = html.unescape(m.group(1)).replace('\\u0026', '&')
        print('thumb host:', clean.split('/')[2], '| len:', len(clean), flush=True)
        req2 = urllib.request.Request(clean, headers={**UA, 'Referer': 'https://www.instagram.com/'})
        data = urllib.request.urlopen(req2, timeout=30).read()
        print('downloaded bytes:', len(data), 'magic:', data[:3], flush=True)
        if not data.startswith((b'\xff\xd8', b'\x89PNG', b'RIFF')):
            print('NOT_AN_IMAGE, first bytes:', data[:16], flush=True)
            continue
        out = os.path.join('assets', name + '.jpg')
        open(out, 'wb').write(data)
        print('SAVED', out, len(data), flush=True)
    except Exception as e:
        print('ERR:', str(e)[:300], flush=True)
