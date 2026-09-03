---
name: Portal build phases
description: Delivery order for the internal portal and what is already built
type: feature
---
Phase 1 (done): auth, roles/permissions data model, RLS, admin (users, roles, departments, audit, settings), dashboard.
Phase 2 (done): employees module — full-width row cards, department tabs, photo upload (private employee-photos bucket), add/edit dialog, document expiry indicators for HR/admin.
Phase 3 (done): workers module (site/trade/labour card expiries), company news (drafts + publish), policies (versioned files), documents library (private company-files bucket, visibility company/restricted/private, expiry badges), dashboard expiry feed + people counts.
Phase 4 (done): staff/worker directory for regular staff — permissions employees.view_directory and workers.view_directory (granted to employee + worker roles) read via security-definer RPCs staff_directory() / worker_directory() that return only name, code, job/trade, department, site, email, phone, status, photo. No salary, passport/visa/ID numbers or expiry dates ever reach non-HR users (enforced in DB, not just UI).
Phase 5 (done): leave module — public.leaves (person name, optional employee/worker link, type, start/end dates, status, remarks). Permissions leaves.view (all roles) and leaves.manage (super_admin/admin/hr). Everyone sees all leave records; only managers add/edit/delete. Employee-photos storage read also allowed for directory-only staff.
Phase 6 (done): org chart module — org_charts + org_chart_nodes, permissions org_charts.view (all roles) / org_charts.manage (super_admin, admin, hr). Charts per department, searchable staff/worker picker for nodes, drag a node onto another to re-parent (cycle guarded), drop on canvas to make top-level. Leave page has an 'Apply for leave' button linking out (placeholder google.com). Certificates table + permissions exist (no UI yet). 50 demo staff + 50 demo workers seeded with pravatar photo URLs; signPhotoUrls passes absolute URLs through.
Not built yet: Sales, Marketing, Production and O&P modules (permissions exist in DB, no UI), certificates module, notifications.
Theme: primary #109c5d, text #3d3d3d, white background.
