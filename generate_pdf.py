from pathlib import Path

content = """ATITECH EDU PVT LTD
MERN Batch Brochure

Course Highlights:
- MongoDB
- Express.js
- React.js
- Node.js
- Project-based learning
- Industry-focused curriculum

Batch Price:
MRP: 499

Contact:
Phone: 6397964720, 6395804360
Email: atitech.edu.pvt.ltd@gmail.com
Website: http://localhost:3000
"""

lines = content.splitlines()
text = "\\n".join(lines)

# Build a simple PDF manually
pdf_lines = []

# Helper to build objects and xref
objects = []

# Catalog
objects.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
# Pages
objects.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
# Page
objects.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")
# Content stream
stream = "BT /F1 14 Tf 50 760 Td "
stream += "(" + text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)') + ") Tj ET"
objects.append(f"4 0 obj\n<< /Length {len(stream.encode('latin-1'))} >>\nstream\n{stream}\nendstream\nendobj\n")
# Font
objects.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

pdf = bytearray(b"%PDF-1.4\n")
offsets = [0]
for obj in objects:
    offsets.append(len(pdf))
    pdf.extend(obj.encode('latin-1'))

xref_pos = len(pdf)
pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode('latin-1'))
pdf.extend(b"0000000000 65535 f \n")
for off in offsets[1:]:
    pdf.extend(f"{off:010d} 00000 n \n".encode('latin-1'))
pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode('latin-1'))

Path('mern-brochure.pdf').write_bytes(pdf)
print('created')
