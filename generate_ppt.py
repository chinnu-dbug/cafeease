import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

TEMPLATE_PATH = r"C:\Users\chimm\.gemini\antigravity\brain\8dfc83b9-2569-4e26-a077-7f893e23c651\.user_uploaded\media_1795673039741_acf4bf5c.pptx"
OUTPUT_PATH = r"C:\Users\chimm\.gemini\antigravity\scratch\cafeease\CAFEEASE_SRU_PRESENTATION.pptx"

prs = Presentation(TEMPLATE_PATH)

NAVY = RGBColor(15, 23, 42)
SLATE = RGBColor(51, 65, 85)
MUTED = RGBColor(100, 116, 139)
BLUE = RGBColor(37, 99, 235)

def format_para(p, text, font_size=14, bold=False, color=SLATE, space_after=6, bullet=False):
    p.text = text
    p.font.name = "Arial"
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.space_after = Pt(space_after)

# -------------------------------------------------------------
# SLIDE 1: Title & Team
# -------------------------------------------------------------
s1 = prs.slides[0]
for shape in s1.shapes:
    if shape.name == "Title 1" and shape.has_text_frame:
        tf = shape.text_frame
        tf.clear()
        p = tf.paragraphs[0]
        format_para(p, "CafeEase: Campus Dining & Table Service", font_size=24, bold=True, color=NAVY, space_after=4)
        p2 = tf.add_paragraph()
        format_para(p2, "A Full-Stack Cafeteria Table Ordering & Payment Reconciliation Platform", font_size=15, bold=False, color=BLUE, space_after=0)
    elif shape.name == "Subtitle 2" and shape.has_text_frame:
        tf = shape.text_frame
        tf.clear()
        members = [
            "Ganesh Chimmula          Hall Ticket No: 2203A51XXX",
            "Team Member 2            Hall Ticket No: 2203A51XXX",
            "Team Member 3            Hall Ticket No: 2203A51XXX",
            "Team Member 4            Hall Ticket No: 2203A51XXX",
            "Team Member 5            Hall Ticket No: 2203A51XXX"
        ]
        for idx, m in enumerate(members):
            p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
            format_para(p, m, font_size=12, bold=False, color=SLATE, space_after=3)
    elif shape.name == "Title 1" and shape.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.TEXT_BOX:
        tf = shape.text_frame
        tf.clear()
        p = tf.paragraphs[0]
        format_para(p, "Team Number: CSE-AI-2026-T12", font_size=14, bold=True, color=NAVY)

# -------------------------------------------------------------
# SLIDE 2: Problem Statement & Context
# -------------------------------------------------------------
s2 = prs.slides[1]
tf2 = s2.shapes[1].text_frame
tf2.clear()

bullets2 = [
    ("Real-World Problem Addressed:", "Severe congestion, manual order accounting errors, and lengthy queue delays during peak lunch intervals in campus cafeterias."),
    ("Target Users & Stakeholders:", "University students dining on campus, cafeteria kitchen staff, and cafeteria administrative/billing managers."),
    ("Significance & Evidence:", "Students waste 20-30 minutes per meal standing in physical queues, leading to missed lecture schedules and cafeteria cash reconciliation mismatches."),
    ("Current Limitations & Gaps:", "Existing setups rely on verbal orders and paper tokens with no table-level coordination, no digital live status tracking, and lack of verified role segregation.")
]

for idx, (title, desc) in enumerate(bullets2):
    p = tf2.paragraphs[0] if idx == 0 else tf2.add_paragraph()
    p.text = f"•  {title} "
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(8)
    
    run = p.add_run()
    run.text = desc
    run.font.name = "Arial"
    run.font.size = Pt(13)
    run.font.bold = False
    run.font.color.rgb = SLATE

# -------------------------------------------------------------
# SLIDE 3: Proposed Solution & Objectives
# -------------------------------------------------------------
s3 = prs.slides[2]
tf3 = s3.shapes[1].text_frame
tf3.clear()

bullets3 = [
    ("Proposed Solution:", "CafeEase is an integrated full-stack responsive web application enabling students to order food directly to their assigned tables while cafeteria managers manage live dispatch and payments."),
    ("Objective 1 - Automated Table Ordering:", "Provide instant category-filtered menu browsing and cart checkout mapped to specific tables (Tables 1-10)."),
    ("Objective 2 - Dual Payment Reconciliation:", "Support simulated Instant Online UPI settlement (PAID) and Counter Cash fulfillment (UNPAID) with admin toggling."),
    ("Objective 3 - Role-Based Access Control (RBAC):", "Strictly isolate student ordering views from administrative financial KPIs and kitchen dispatch dashboards."),
    ("Objective 4 - Custom Dish Management:", "Allow cafeteria managers to onboard new food items with live Base64 photo uploads stored directly in MongoDB.")
]

for idx, (title, desc) in enumerate(bullets3):
    p = tf3.paragraphs[0] if idx == 0 else tf3.add_paragraph()
    p.text = f"•  {title} "
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(7)
    
    run = p.add_run()
    run.text = desc
    run.font.name = "Arial"
    run.font.size = Pt(13)
    run.font.bold = False
    run.font.color.rgb = SLATE

# -------------------------------------------------------------
# SLIDE 4: Users, Scope & Use Cases
# -------------------------------------------------------------
s4 = prs.slides[3]
tf4 = s4.shapes[1].text_frame
tf4.clear()

bullets4 = [
    ("Primary Users:", "Students/Faculty (table diners) and Cafeteria Managers/Kitchen Dispatchers (administrators)."),
    ("Student Use Cases:", "Browse menu by category (Fast Food, Meals, Beverages), select table number, add items to cart, choose UPI/Cash, and view live order receipt."),
    ("Admin Use Cases:", "View live revenue metrics, edit order prices, remove orders, toggle payment states (PAID/UNPAID), advance kitchen status (Received -> Preparing -> Served), and add new dishes with photos."),
    ("Current Scope:", "End-to-end 3-tier web app with strict client-side password strength rules, Express REST API, and MongoDB Atlas database."),
    ("Limitations & Out of Scope:", "Hardware kitchen printer integration and real bank UPI payment gateways (currently simulated).")
]

for idx, (title, desc) in enumerate(bullets4):
    p = tf4.paragraphs[0] if idx == 0 else tf4.add_paragraph()
    p.text = f"•  {title} "
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(7)
    run = p.add_run()
    run.text = desc
    run.font.name = "Arial"
    run.font.size = Pt(13)
    run.font.bold = False
    run.font.color.rgb = SLATE

# -------------------------------------------------------------
# SLIDE 5: Team Members & Contributions
# -------------------------------------------------------------
s5 = prs.slides[4]
tf5 = s5.shapes[1].text_frame
tf5.clear()

bullets5 = [
    ("Member 1 – Ganesh Chimmula (2203A51XXX) [Team Lead & Full-Stack]:", "Engineered Express.js REST API routes, MongoDB Atlas schemas, resilient auto-reconnect, and deployment pipelines."),
    ("Member 2 – Student 2 (2203A51XXX) [Frontend Architecture]:", "Designed professional responsive UI layouts (HTML5/CSS3), category filter logic, and interactive cart drawer."),
    ("Member 3 – Student 3 (2203A51XXX) [Security & Authentication]:", "Implemented strict password validation (8+ chars, upper/lower/numbers/special), live strength meter, and RBAC views."),
    ("Member 4 – Student 4 (2203A51XXX) [Admin & Reconciliation]:", "Developed admin financial analytics dashboard, live payment toggle switch, and kitchen ticket dispatch state machine."),
    ("Member 5 – Student 5 (2203A51XXX) [Testing & Documentation]:", "Authored comprehensive test case matrix, API verification benchmarks, and course project documentation.")
]

for idx, (title, desc) in enumerate(bullets5):
    p = tf5.paragraphs[0] if idx == 0 else tf5.add_paragraph()
    p.text = f"•  {title} "
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(7)
    run = p.add_run()
    run.text = desc
    run.font.name = "Arial"
    run.font.size = Pt(12)
    run.font.bold = False
    run.font.color.rgb = SLATE

# -------------------------------------------------------------
# SLIDE 6: Workflow / System Architecture
# -------------------------------------------------------------
s6 = prs.slides[5]
spTree6 = s6.shapes._spTree
for shape in list(s6.shapes):
    if shape.name == "Rounded Rectangle 7":
        spTree6.remove(shape._element)

tf6 = s6.shapes[1].text_frame
tf6.clear()

p = tf6.paragraphs[0]
p.text = "•  Client-Server Flow: Student Browser  ──(JSON HTTP)──>  Express.js REST API  ──(Mongoose)──>  MongoDB Atlas"
p.font.name = "Arial"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = BLUE
p.space_after = Pt(4)

p_sub = tf6.add_paragraph()
p_sub.text = "•  Sequential Process: Select Food Items -> Confirm Table Number -> Checkout (UPI / Cash) -> Express API -> MongoDB Document -> Live Admin Reconciliation Dashboard."
p_sub.font.name = "Arial"
p_sub.font.size = Pt(11)
p_sub.font.color.rgb = SLATE
p_sub.space_after = Pt(8)

# Add structured table for 3-tier architecture
table_shape = s6.shapes.add_table(4, 3, Inches(0.8), Inches(2.9), Inches(11.6), Inches(2.8))
table = table_shape.table
table.columns[0].width = Inches(2.6)
table.columns[1].width = Inches(4.2)
table.columns[2].width = Inches(4.8)

headers = ["Architecture Tier", "Key Technologies & Components", "Operational Responsibilities"]
for i, h in enumerate(headers):
    cell = table.cell(0, i)
    cell.fill.solid()
    cell.fill.fore_color.rgb = NAVY
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = RGBColor(255, 255, 255)

rows_data = [
    ("Presentation Tier\n(Frontend Client)", "Semantic HTML5, Responsive CSS3 Grid/Flexbox, Native ES6+ JavaScript, FileReader API", "Delivers clean, emoji-free UI, dynamic menu filtering, interactive cart, client-side password strength validation, and Base64 photo uploads."),
    ("Application Tier\n(Node.js / Express)", "Node.js v20+, Express.js 4.x, CORS Middleware, JSON Body Parser (25MB limit), REST Controllers", "Processes API routes (/api/auth, /api/menu, /api/orders), enforces role security, coordinates auto-reconnection, and handles serverless cold starts."),
    ("Data Tier\n(Database Storage)", "MongoDB Atlas Cloud / Community Server, Mongoose 8.x ODM, Indexed JSON Collections", "Stores Users (students/admins), Menu Items (with image URLs/Base64), and Table Orders with live payment status and kitchen states.")
]

for row_idx, data in enumerate(rows_data):
    for col_idx, text in enumerate(data):
        cell = table.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(248, 250, 252) if row_idx % 2 == 0 else RGBColor(255, 255, 255)
        p = cell.text_frame.paragraphs[0]
        p.text = text
        p.font.size = Pt(11)
        p.font.color.rgb = NAVY if col_idx == 0 else SLATE
        p.font.bold = (col_idx == 0)

# -------------------------------------------------------------
# SLIDE 7: Technology Stack & Resources
# -------------------------------------------------------------
s7 = prs.slides[6]
tf7 = s7.shapes[1].text_frame
tf7.clear()

bullets7 = [
    ("Programming Languages:", "JavaScript (ES6+ Vanilla), HTML5 Semantic Markup, CSS3 Modern Flexbox & Grid."),
    ("Frameworks & Libraries:", "Node.js (Runtime Engine), Express.js (RESTful Web Server), Mongoose (NoSQL ODM), CORS & Dotenv."),
    ("Database & Cloud Storage:", "MongoDB Atlas (Cloud-Hosted Replica Set) / Local MongoDB Server (port 27017)."),
    ("Cloud Deployment & Hosting:", "Vercel Serverless Platform (configured with custom vercel.json routing and API serverless entry)."),
    ("Development Environment:", "Visual Studio Code, PowerShell 5.1/7, Git Version Control, GitHub Repository (chinnu-dbug/cafeease).")
]

for idx, (title, desc) in enumerate(bullets7):
    p = tf7.paragraphs[0] if idx == 0 else tf7.add_paragraph()
    p.text = f"•  {title} "
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(10)
    run = p.add_run()
    run.text = desc
    run.font.name = "Arial"
    run.font.size = Pt(13)
    run.font.bold = False
    run.font.color.rgb = SLATE

# -------------------------------------------------------------
# SLIDE 8: Modules & Key Features
# -------------------------------------------------------------
s8 = prs.slides[7]
tf8 = s8.shapes[1].text_frame
tf8.clear()

bullets8 = [
    ("Module 1 - Auth & Strict Password Security [Implemented]:", "Dual Student/Admin registration with passkey gate (CAFE2026), live 5-rule password strength verification, and server-side authentication check."),
    ("Module 2 - Dynamic Menu & Instant Filtering [Implemented]:", "Real-time GET /api/menu synchronization with zero-reload category filters (Fast Food, Meals, Beverages) and responsive food cards."),
    ("Module 3 - Table Cart & Checkout Reconciliation [Implemented]:", "Interactive slide-in order tray, table selector (Tables 1-10), quantity mutator, and dual payment mode (UPI = PAID, Cash = UNPAID)."),
    ("Module 4 - Admin Management & Kitchen Dispatch [Implemented]:", "Live operational metrics (revenue, orders), one-click payment toggling, kitchen status pipeline, order price editing, and order removal."),
    ("Module 5 - Custom Dish Onboarding with Image Upload [Implemented]:", "Admin modal allowing custom food creation with Base64 image conversion via FileReader API supporting payloads up to 25MB.")
]

for idx, (title, desc) in enumerate(bullets8):
    p = tf8.paragraphs[0] if idx == 0 else tf8.add_paragraph()
    p.text = f"•  {title} "
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(7)
    run = p.add_run()
    run.text = desc
    run.font.name = "Arial"
    run.font.size = Pt(12)
    run.font.bold = False
    run.font.color.rgb = SLATE

# -------------------------------------------------------------
# SLIDE 9: Screenshots – Application / Output
# -------------------------------------------------------------
s9 = prs.slides[8]
tf9 = s9.shapes[1].text_frame
tf9.clear()

p9_intro = tf9.paragraphs[0]
p9_intro.text = "Actual Working System Screenshots (Live Campus Dining Application):"
p9_intro.font.name = "Arial"
p9_intro.font.size = Pt(12)
p9_intro.font.bold = True
p9_intro.font.color.rgb = NAVY
p9_intro.space_after = Pt(4)

img1 = r"C:\Users\chimm\.gemini\antigravity\brain\8dfc83b9-2569-4e26-a077-7f893e23c651\.user_uploaded\media_1795453403550_c1e0e2fe.jpg"
img2 = r"C:\Users\chimm\.gemini\antigravity\brain\8dfc83b9-2569-4e26-a077-7f893e23c651\.user_uploaded\media_1794299488491_1d7ca6f1.png"

if os.path.exists(img1):
    s9.shapes.add_picture(img1, Inches(0.8), Inches(2.4), width=Inches(5.6))
    cap1 = s9.shapes.add_textbox(Inches(0.8), Inches(5.3), Inches(5.6), Inches(0.6))
    p = cap1.text_frame.paragraphs[0]
    p.text = "Figure 1: Student Dining View — Categorized menu items, active table badge, and add-to-order workflow."
    p.font.size = Pt(10)
    p.font.color.rgb = SLATE
    p.font.italic = True

if os.path.exists(img2):
    s9.shapes.add_picture(img2, Inches(6.8), Inches(2.4), width=Inches(5.6))
    cap2 = s9.shapes.add_textbox(Inches(6.8), Inches(5.3), Inches(5.6), Inches(0.6))
    p = cap2.text_frame.paragraphs[0]
    p.text = "Figure 2: Authentication & Operational Portal — Role-segregated signup with security key and credentials."
    p.font.size = Pt(10)
    p.font.color.rgb = SLATE
    p.font.italic = True

# -------------------------------------------------------------
# SLIDE 10: Implementation & Testing
# -------------------------------------------------------------
s10 = prs.slides[9]
tf10 = s10.shapes[1].text_frame
tf10.clear()

p10_1 = tf10.paragraphs[0]
p10_1.text = "•  Implementation Milestones: (1) MongoDB Mongoose schemas with indexed IDs. (2) Express REST endpoints with auto-reconnect. (3) Client-side dynamic state engine with 6s health polling. (4) Cloud deployment via Vercel & MongoDB Atlas."
p10_1.font.name = "Arial"
p10_1.font.size = Pt(11)
p10_1.font.color.rgb = NAVY
p10_1.space_after = Pt(6)

# Add Test Matrix Table
table_shape10 = s10.shapes.add_table(6, 4, Inches(0.8), Inches(2.8), Inches(11.6), Inches(3.0))
t10 = table_shape10.table
t10.columns[0].width = Inches(1.3)
t10.columns[1].width = Inches(3.4)
t10.columns[2].width = Inches(5.6)
t10.columns[3].width = Inches(1.3)

headers10 = ["Test ID", "Test Scope & Description", "Input / Precondition & Expected Result", "Status"]
for i, h in enumerate(headers10):
    cell = t10.cell(0, i)
    cell.fill.solid()
    cell.fill.fore_color.rgb = NAVY
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(255, 255, 255)

test_data = [
    ("TC-01", "Student & Admin Registration", "Valid credentials + passkey -> Stored in MongoDB, redirected to app", "PASS"),
    ("TC-02", "Strict Password Validation", "Password <8 chars or missing special -> Blocked with live visual error", "PASS"),
    ("TC-03", "Order Checkout & Payment", "Cart ₹230 UPI -> Saved as PAID; Cart ₹240 Cash -> Saved as UNPAID", "PASS"),
    ("TC-04", "Admin Payment Reconciliation", "Click 'Mark as Paid' on cash order -> Database updated, revenue refreshed", "PASS"),
    ("TC-05", "Admin Edit Price & Delete", "Modify order price -> PATCH /api/orders/:id/price updates MongoDB live", "PASS")
]

for row_idx, (tid, desc, res, stat) in enumerate(test_data):
    for col_idx, val in enumerate([tid, desc, res, stat]):
        cell = t10.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(248, 250, 252) if row_idx % 2 == 0 else RGBColor(255, 255, 255)
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.size = Pt(10)
        p.font.color.rgb = RGBColor(16, 185, 129) if col_idx == 3 else (NAVY if col_idx == 0 else SLATE)
        p.font.bold = (col_idx == 3 or col_idx == 0)

# -------------------------------------------------------------
# SLIDE 11: Results, Impact & Limitations
# -------------------------------------------------------------
s11 = prs.slides[10]
tf11 = s11.shapes[1].text_frame
tf11.clear()

bullets11 = [
    ("Key Functional Results:", "Successfully engineered a working end-to-end full-stack campus dining application connecting HTML/CSS/JS frontend to Node.js backend and cloud MongoDB Atlas."),
    ("Operational Impact:", "Eliminates counter queue congestion during peak lunch breaks, speeds up order turnaround to under 3 minutes, and prevents cash collection mismatches."),
    ("Security & Data Integrity:", "Role-Based Access Control completely prevents students from viewing financial reports; strict password validation enforces strong campus credentials."),
    ("High Reliability:", "Built-in resilient database reconnection and offline cache guarantee that cafeteria ordering remains accessible even during brief network fluctuations."),
    ("Current System Limitations:", "Simulated digital payments instead of live bank gateway webhooks; manual kitchen dispatch instead of automated ticket receipt printer integration.")
]

for idx, (title, desc) in enumerate(bullets11):
    p = tf11.paragraphs[0] if idx == 0 else tf11.add_paragraph()
    p.text = f"•  {title} "
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(8)
    run = p.add_run()
    run.text = desc
    run.font.name = "Arial"
    run.font.size = Pt(13)
    run.font.bold = False
    run.font.color.rgb = SLATE

# -------------------------------------------------------------
# SLIDE 12: Conclusion & Feature Scope
# -------------------------------------------------------------
s12 = prs.slides[11]
tf12 = s12.shapes[1].text_frame
tf12.clear()

bullets12 = [
    ("Project Conclusion:", "CafeEase proves that full-stack web technologies (Node.js, Express, MongoDB) can effectively replace outdated manual dining queues with efficient digital table ordering and billing."),
    ("Academic Fulfillment:", "Meets all course requirements for Web Technologies & Full-Stack Development at the School of CS&AI, SR University."),
    ("Future Scope 1 - Live Payment Gateways:", "Integrate production Razorpay/Stripe webhooks for automated payment verification callbacks."),
    ("Future Scope 2 - Real-Time WebSockets:", "Implement Socket.io for instantaneous bidirectional updates between student screens and kitchen order display units (KDU)."),
    ("Future Scope 3 - Native Mobile Applications:", "Package the responsive web application into native Android/iOS builds using Capacitor or React Native."),
    ("Future Scope 4 - AI Dining Analytics:", "Predict daily ingredient demand based on historical dining order volumes to minimize cafeteria food wastage.")
]

for idx, (title, desc) in enumerate(bullets12):
    p = tf12.paragraphs[0] if idx == 0 else tf12.add_paragraph()
    p.text = f"•  {title} "
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(7)
    run = p.add_run()
    run.text = desc
    run.font.name = "Arial"
    run.font.size = Pt(13)
    run.font.bold = False
    run.font.color.rgb = SLATE

# Save presentation
prs.save(OUTPUT_PATH)
print("Presentation created successfully at:", OUTPUT_PATH)
