from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
files = list((ROOT / 'assets' / 'brand' / 'variants').glob('*.svg'))
assert len(files) == 10
for file in files:
    root = ET.parse(file).getroot()
    ids = [node.attrib['id'] for node in root.iter() if 'id' in node.attrib]
    assert len(ids) == len(set(ids)), file
    assert not root.findall('.//{http://www.w3.org/2000/svg}image'), file
    assert not root.findall('.//{http://www.w3.org/2000/svg}text'), file
    assert not root.findall('.//{http://www.w3.org/2000/svg}script'), file
    assert all('href' not in key for node in root.iter() for key in node.attrib), file
print('All 10 SVGs Parse, Have Unique IDs, And Need No External Resources')


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        self.references += [value for key, value in attrs if key in ('href', 'src')]


parser = Links()
parser.feed((HERE / 'index.html').read_text(encoding='utf-8'))
for reference in parser.references:
    assert (HERE / reference).resolve().is_file(), reference
print(f'All {len(parser.references)} Gallery References Exist Locally')
